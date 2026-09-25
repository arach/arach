import CryptoKit
import Foundation
import Security

/// Only the vault encryption key belongs in this store, never account records.
public protocol VaultKeyStore {
    func create(id: String, key: SymmetricKey) throws
    func load(id: String) throws -> SymmetricKey
}

public final class KeychainVaultKeys: VaultKeyStore {
    private let keychain: SecKeychain
    private let prefix: String
    private let allowUI: Bool

    public init(keychain: SecKeychain? = nil, prefix: String = "localotp:vault", allowAuthenticationUI: Bool = true) throws {
        if let keychain { self.keychain = keychain }
        else {
            var result: SecKeychain?
            try Self.check(SecKeychainCopyDefault(&result))
            guard let result else { throw StoreError.malformed }
            self.keychain = result
        }
        self.prefix = prefix
        self.allowUI = allowAuthenticationUI
    }

    private func query(id: String) throws -> [String: Any] {
        guard UUID(uuidString: id)?.uuidString == id else { throw VaultError.invalid }
        return [kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: prefix + ":" + id,
                kSecAttrAccount as String: NSUserName(),
                kSecUseAuthenticationUI as String: allowUI ? kSecUseAuthenticationUIAllow : kSecUseAuthenticationUIFail]
    }

    public func create(id: String, key: SymmetricKey) throws {
        guard key.bitCount == 256 else { throw VaultError.invalid }
        var access: SecAccess?
        try Self.check(SecAccessCreate("LocalOTP vault key" as CFString, nil, &access))
        guard let access else { throw StoreError.malformed }
        var request = try query(id: id)
        request[kSecUseKeychain as String] = keychain
        request[kSecAttrAccess as String] = access
        request[kSecAttrLabel as String] = "LocalOTP vault key"
        request[kSecValueData as String] = key.withUnsafeBytes { Data($0) }
        try Self.check(SecItemAdd(request as CFDictionary, nil))
    }

    public func load(id: String) throws -> SymmetricKey {
        var request = try query(id: id)
        request[kSecMatchSearchList as String] = [keychain]
        request[kSecReturnData as String] = true
        request[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(request as CFDictionary, &result)
        if status == errSecItemNotFound { throw VaultError.missingKey }
        try Self.check(status)
        guard let data = result as? Data, data.count == 32 else { throw VaultError.invalid }
        return SymmetricKey(data: data)
    }

    private static func check(_ status: OSStatus) throws {
        guard status == errSecSuccess else { throw StoreError.keychain(status) }
    }
}
