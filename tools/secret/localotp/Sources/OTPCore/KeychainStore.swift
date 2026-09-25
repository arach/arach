import Foundation
import Security

public enum StoreError: Error {
    case duplicate, missing, keychain(OSStatus), malformed
}

/// File-based macOS Keychain. No sidecar secret files or synchronizable items.
public final class KeychainStore {
    private let keychain: SecKeychain
    private let service: String
    private let allowAuthenticationUI: Bool

    public init(keychain: SecKeychain? = nil, service: String = "local.localotp.accounts.v1", allowAuthenticationUI: Bool = true) throws {
        if let keychain {
            self.keychain = keychain
        } else {
            var result: SecKeychain?
            try Self.check(SecKeychainCopyDefault(&result))
            guard let result else { throw StoreError.malformed }
            self.keychain = result
        }
        self.service = service
        self.allowAuthenticationUI = allowAuthenticationUI
    }

    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: service,
         kSecUseAuthenticationUI as String: allowAuthenticationUI ? kSecUseAuthenticationUIAllow : kSecUseAuthenticationUIFail,
         kSecMatchSearchList as String: [keychain]]
    }

    public func add(name: String, record: AccountRecord) throws {
        try AccountRecord.validateName(name)
        try record.validate()
        var access: SecAccess?
        // NULL trusted list means only the creating executable is trusted.
        try Self.check(SecAccessCreate("LocalOTP account" as CFString, nil, &access))
        guard let access else { throw StoreError.malformed }
        let attributes: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecUseKeychain as String: keychain,
            kSecAttrService as String: service,
            kSecAttrAccount as String: name,
            kSecAttrLabel as String: "LocalOTP: " + name,
            kSecAttrAccess as String: access,
            kSecUseAuthenticationUI as String: allowAuthenticationUI ? kSecUseAuthenticationUIAllow : kSecUseAuthenticationUIFail,
            kSecValueData as String: try JSONEncoder().encode(record)
        ]
        try Self.check(SecItemAdd(attributes as CFDictionary, nil))
    }

    public func names() throws -> [String] {
        var request = query
        request[kSecReturnAttributes as String] = true
        request[kSecMatchLimit as String] = kSecMatchLimitAll
        // Deliberately never request kSecReturnData in the listing path.
        var result: CFTypeRef?
        let status = SecItemCopyMatching(request as CFDictionary, &result)
        if status == errSecItemNotFound { return [] }
        try Self.check(status)
        guard let rows = result as? [[String: Any]] else { throw StoreError.malformed }
        return try rows.map { row in
            guard let name = row[kSecAttrAccount as String] as? String else { throw StoreError.malformed }
            try AccountRecord.validateName(name)
            return name
        }.sorted()
    }

    public func read(name: String) throws -> AccountRecord {
        try AccountRecord.validateName(name)
        var request = query
        request[kSecAttrAccount as String] = name
        request[kSecReturnData as String] = true
        request[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        try Self.check(SecItemCopyMatching(request as CFDictionary, &result))
        guard let data = result as? Data else { throw StoreError.malformed }
        do {
            let record = try JSONDecoder().decode(AccountRecord.self, from: data)
            try record.validate()
            return record
        } catch { throw StoreError.malformed }
    }

    public func remove(name: String) throws {
        try AccountRecord.validateName(name)
        var request = query
        request[kSecAttrAccount as String] = name
        try Self.check(SecItemDelete(request as CFDictionary))
    }

    private static func check(_ status: OSStatus) throws {
        switch status {
        case errSecSuccess: return
        case errSecDuplicateItem: throw StoreError.duplicate
        case errSecItemNotFound: throw StoreError.missing
        default: throw StoreError.keychain(status)
        }
    }
}
