import CryptoKit
import Darwin
import Foundation
import SecureInput

public enum TransferError: Error { case invalidFile, authentication }

public enum ExtensionTransfer {
    private struct Envelope: Decodable {
        let format: String
        let version: Int
        let kdf: String
        let iterations: Int
        let salt: Data
        let iv: Data
        let ciphertext: Data
    }
    private struct Payload: Decodable {
        let label: String
        let secret: String
    }

    public static func readFile(path: String) throws -> Data {
        let fd = open(path, O_RDONLY | O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC)
        guard fd >= 0 else { throw TransferError.invalidFile }
        defer { close(fd) }
        var info = stat()
        guard fstat(fd, &info) == 0, info.st_mode & S_IFMT == S_IFREG,
              info.st_size > 0, info.st_size <= 65536 else { throw TransferError.invalidFile }
        var data = Data(count: Int(info.st_size))
        try data.withUnsafeMutableBytes { buffer in
            var offset = 0
            while offset < buffer.count {
                let count = Darwin.read(fd, buffer.baseAddress!.advanced(by: offset), buffer.count - offset)
                if count < 0 && errno == EINTR { continue }
                guard count > 0 else { throw TransferError.invalidFile }
                offset += count
            }
        }
        try validate(data)
        return data
    }

    private static func envelope(_ data: Data) throws -> Envelope {
        guard data.count <= 65536 else { throw TransferError.invalidFile }
        do {
            let value = try JSONDecoder().decode(Envelope.self, from: data)
            guard value.format == "localotp-extension-transfer", value.version == 1,
                  value.kdf == "PBKDF2-SHA256", value.iterations == 600000,
                  value.salt.count == 32, value.iv.count == 12,
                  (17...16384).contains(value.ciphertext.count) else { throw TransferError.invalidFile }
            return value
        } catch { throw TransferError.invalidFile }
    }

    public static func validate(_ data: Data) throws { _ = try envelope(data) }

    /// For an explicit private pipe from a trusted local process or SSH.
    /// Never return this payload to an agent tool, terminal, log, or file.
    public static func decodePrivatePipe(_ data: Data) throws -> AccountRecord {
        guard data.count <= 16384 else { throw TransferError.invalidFile }
        do {
            let payload = try JSONDecoder().decode(Payload.self, from: data)
            try AccountRecord.validateName(payload.label)
            return try AccountRecord(secret: Base32.decode(payload.secret), parameters: Parameters())
        } catch { throw TransferError.invalidFile }
    }

    public static func decrypt(_ data: Data, password: String) throws -> AccountRecord {
        let value = try envelope(data)
        let bytes = Data(password.utf8)
        guard (16...1024).contains(bytes.count) else { throw TransferError.authentication }
        var derived = Data(count: 32)
        defer { derived.withUnsafeMutableBytes { localotp_wipe($0.baseAddress!, $0.count) } }
        let status = derived.withUnsafeMutableBytes { output in
            bytes.withUnsafeBytes { input in
                value.salt.withUnsafeBytes { salt in
                    localotp_transfer_key(input.baseAddress, input.count, salt.baseAddress, salt.count, output.baseAddress)
                }
            }
        }
        guard status == 0 else { throw TransferError.authentication }
        do {
            let sealed = try AES.GCM.SealedBox(nonce: AES.GCM.Nonce(data: value.iv),
                                              ciphertext: value.ciphertext.dropLast(16), tag: value.ciphertext.suffix(16))
            let clear = try AES.GCM.open(sealed, using: SymmetricKey(data: derived),
                                         authenticating: Data("LocalOTP extension transfer v1".utf8))
            let payload = try JSONDecoder().decode(Payload.self, from: clear)
            try AccountRecord.validateName(payload.label)
            // Transfer format v1 uses SHA1 / 6 digits / 30 seconds.
            return try AccountRecord(secret: Base32.decode(payload.secret), parameters: Parameters())
        } catch { throw TransferError.authentication }
    }
}
