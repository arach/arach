import CryptoKit
import Darwin
import Foundation

public enum VaultError: Error {
    case invalid, missingKey, unsafePath, io, busy, full
}

/// Ciphertexts only on disk. The encrypted index permits listing names without
/// decrypting seed records. CryptoKit supplies AES-256-GCM and fresh nonces.
public final class VaultStore {
    public static var defaultDirectory: URL {
        FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent(".config/localotp", isDirectory: true)
    }

    private struct Entry: Codable {
        let id: String
        let digest: Data
    }
    private struct Envelope: Codable {
        let version: Int
        let id: String
        var index: Data
        var records: [String: Data]
    }
    private struct OpenVault {
        var envelope: Envelope
        let key: SymmetricKey
        var entries: [String: Entry]
    }

    private let directory: URL
    private let keys: any VaultKeyStore
    private let maxBytes = 16 * 1024 * 1024

    public init(directory: URL = VaultStore.defaultDirectory, keys: any VaultKeyStore) {
        self.directory = directory
        self.keys = keys
    }

    public func names() throws -> [String] {
        try locked { fd in
            guard let vault = try load(fd: fd) else { return [] }
            return vault.entries.keys.sorted()
        }
    }

    public func read(name: String) throws -> AccountRecord {
        try AccountRecord.validateName(name)
        return try locked { fd in
            guard let vault = try load(fd: fd), let entry = vault.entries[name],
                  let ciphertext = vault.envelope.records[entry.id] else { throw StoreError.missing }
            do {
                let plaintext = try unseal(ciphertext, key: vault.key, vault: vault.envelope.id, part: entry.id)
                let record = try JSONDecoder().decode(AccountRecord.self, from: plaintext)
                try record.validate()
                return record
            } catch { throw VaultError.invalid }
        }
    }

    public func add(name: String, record: AccountRecord) throws {
        try AccountRecord.validateName(name)
        try record.validate()
        try locked { fd in
            var vault: OpenVault
            if let existing = try load(fd: fd) { vault = existing }
            else {
                let id = UUID().uuidString
                let key = SymmetricKey(size: .bits256)
                try keys.create(id: id, key: key)
                vault = OpenVault(envelope: Envelope(version: 1, id: id, index: Data(), records: [:]), key: key, entries: [:])
            }
            guard vault.entries[name] == nil else { throw StoreError.duplicate }
            guard vault.entries.count < 1000 else { throw VaultError.full }
            let id = UUID().uuidString
            let ciphertext = try seal(JSONEncoder().encode(record), key: vault.key, vault: vault.envelope.id, part: id)
            vault.entries[name] = Entry(id: id, digest: Data(SHA256.hash(data: ciphertext)))
            vault.envelope.records[id] = ciphertext
            try save(&vault, fd: fd)
        }
    }

    public func remove(name: String) throws {
        try AccountRecord.validateName(name)
        try locked { fd in
            guard var vault = try load(fd: fd), let entry = vault.entries.removeValue(forKey: name) else { throw StoreError.missing }
            vault.envelope.records.removeValue(forKey: entry.id)
            try save(&vault, fd: fd)
        }
    }

    private func aad(vault: String, part: String) -> Data {
        Data(("LocalOTP/vault/1/" + vault + "/" + part).utf8)
    }

    private func seal(_ data: Data, key: SymmetricKey, vault: String, part: String) throws -> Data {
        guard let result = try AES.GCM.seal(data, using: key, authenticating: aad(vault: vault, part: part)).combined else {
            throw VaultError.invalid
        }
        return result
    }

    private func unseal(_ data: Data, key: SymmetricKey, vault: String, part: String) throws -> Data {
        try AES.GCM.open(AES.GCM.SealedBox(combined: data), using: key, authenticating: aad(vault: vault, part: part))
    }

    private func load(fd: Int32) throws -> OpenVault? {
        guard let data = try readFile(fd: fd) else { return nil }
        let envelope: Envelope
        do { envelope = try JSONDecoder().decode(Envelope.self, from: data) }
        catch { throw VaultError.invalid }
        guard envelope.version == 1, UUID(uuidString: envelope.id)?.uuidString == envelope.id,
              envelope.records.count <= 1000 else { throw VaultError.invalid }
        let key = try keys.load(id: envelope.id)
        guard key.bitCount == 256 else { throw VaultError.invalid }
        do {
            let plaintext = try unseal(envelope.index, key: key, vault: envelope.id, part: "index")
            let entries = try JSONDecoder().decode([String: Entry].self, from: plaintext)
            guard entries.count == envelope.records.count,
                  Set(entries.values.map(\.id)).count == entries.count else { throw VaultError.invalid }
            for (name, entry) in entries {
                try AccountRecord.validateName(name)
                guard UUID(uuidString: entry.id)?.uuidString == entry.id,
                      let record = envelope.records[entry.id], record.count <= 8192,
                      entry.digest == Data(SHA256.hash(data: record)) else { throw VaultError.invalid }
            }
            return OpenVault(envelope: envelope, key: key, entries: entries)
        } catch { throw VaultError.invalid }
    }

    private func save(_ vault: inout OpenVault, fd: Int32) throws {
        vault.envelope.index = try seal(JSONEncoder().encode(vault.entries), key: vault.key, vault: vault.envelope.id, part: "index")
        let data = try JSONEncoder().encode(vault.envelope)
        guard data.count <= maxBytes else { throw VaultError.full }
        let temporary = ".vault-" + UUID().uuidString
        let output = openat(fd, temporary, O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC, 0o600)
        guard output >= 0 else { throw VaultError.io }
        defer { close(output); unlinkat(fd, temporary, 0) }
        try data.withUnsafeBytes { bytes in
            var written = 0
            while written < bytes.count {
                let count = Darwin.write(output, bytes.baseAddress!.advanced(by: written), bytes.count - written)
                if count < 0 && errno == EINTR { continue }
                guard count > 0 else { throw VaultError.io }
                written += count
            }
        }
        guard fsync(output) == 0, renameat(fd, temporary, fd, "vault.json") == 0 else { throw VaultError.io }
        // Publication already succeeded; retaining the matching key is essential.
        guard fsync(fd) == 0 else { throw VaultError.io }
    }

    private func checkFile(_ fd: Int32, directory: Bool = false) throws -> stat {
        var info = stat()
        guard fstat(fd, &info) == 0 else { throw VaultError.io }
        guard info.st_uid == geteuid(), info.st_mode & 0o077 == 0,
              info.st_mode & S_IFMT == (directory ? S_IFDIR : S_IFREG),
              directory || info.st_nlink == 1 else { throw VaultError.unsafePath }
        return info
    }

    private func readFile(fd: Int32) throws -> Data? {
        let input = openat(fd, "vault.json", O_RDONLY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)
        if input < 0 {
            if errno == ENOENT { return nil }
            throw VaultError.unsafePath
        }
        defer { close(input) }
        let info = try checkFile(input)
        guard info.st_size > 0, info.st_size <= maxBytes else { throw VaultError.invalid }
        var data = Data(count: Int(info.st_size))
        try data.withUnsafeMutableBytes { bytes in
            var offset = 0
            while offset < bytes.count {
                let count = Darwin.read(input, bytes.baseAddress!.advanced(by: offset), bytes.count - offset)
                if count < 0 && errno == EINTR { continue }
                guard count > 0 else { throw VaultError.io }
                offset += count
            }
        }
        return data
    }

    private func locked<T>(_ operation: (Int32) throws -> T) throws -> T {
        do {
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        } catch { throw VaultError.io }
        let fd = open(directory.path, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC)
        guard fd >= 0 else { throw VaultError.unsafePath }
        defer { close(fd) }
        _ = try checkFile(fd, directory: true)
        let lock = openat(fd, ".lock", O_RDWR | O_CREAT | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC, 0o600)
        guard lock >= 0 else { throw VaultError.unsafePath }
        defer { close(lock) }
        _ = try checkFile(lock)
        guard flock(lock, LOCK_EX | LOCK_NB) == 0 else { throw VaultError.busy }
        defer { flock(lock, LOCK_UN) }
        return try operation(fd)
    }
}
