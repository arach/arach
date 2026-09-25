import Foundation
import Security
import XCTest
@testable import OTPCore

final class KeychainTests: XCTestCase {
    func testIsolatedKeychainLifecycle() throws {
        guard let root = ProcessInfo.processInfo.environment["LOCALOTP_TEST_KEYCHAIN_DIR"] else {
            throw XCTSkip("Set LOCALOTP_TEST_KEYCHAIN_DIR to a scratch directory to test a disposable Keychain.")
        }
        // Never ask the user to authorize disposable test data. This remains
        // disabled through all cleanup; SecItem queries also explicitly fail UI.
        XCTAssertEqual(SecKeychainSetUserInteractionAllowed(false), errSecSuccess)
        defer { _ = SecKeychainSetUserInteractionAllowed(true) }
        let directory = URL(fileURLWithPath: root).appendingPathComponent("localotp-test-" + UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true,
                                                attributes: [.posixPermissions: 0o700])
        defer { try? FileManager.default.removeItem(at: directory) }
        let path = directory.appendingPathComponent("fixture.keychain").path
        // Disposable synthetic fixture only, unrelated to the user's login Keychain.
        let password = UUID().uuidString
        var keychain: SecKeychain?
        let created = password.withCString { SecKeychainCreate(path, UInt32(password.utf8.count), $0, false, nil, &keychain) }
        XCTAssertEqual(created, errSecSuccess)
        guard created == errSecSuccess, let keychain else { return }
        defer { XCTAssertEqual(SecKeychainDelete(keychain), errSecSuccess) }
        let store = try KeychainStore(keychain: keychain, service: "local.localotp.test." + UUID().uuidString, allowAuthenticationUI: false)
        XCTAssertTrue(try store.names().isEmpty)
        let record = try AccountRecord(secret: Data("12345678901234567890".utf8), parameters: Parameters())
        try store.add(name: "fixture", record: record)
        XCTAssertEqual(try store.names(), ["fixture"])
        XCTAssertThrowsError(try store.add(name: "fixture", record: record)) { error in
            guard case StoreError.duplicate = error else { return XCTFail("Wrong duplicate error") }
        }
        let restored = try store.read(name: "fixture")
        XCTAssertTrue(restored.secret == record.secret, "Fixture roundtrip mismatch; values redacted")
        XCTAssertTrue(restored.parameters == record.parameters)
        let actual = try OTP.code(secret: restored.secret, time: 59, parameters: restored.parameters)
        XCTAssertTrue(actual == "287082", "Fixture code mismatch; values redacted")
        let otherNamespace = try KeychainStore(keychain: keychain, service: "local.localotp.unrelated", allowAuthenticationUI: false)
        XCTAssertTrue(try otherNamespace.names().isEmpty)
        XCTAssertThrowsError(try otherNamespace.read(name: "fixture"))
        try store.remove(name: "fixture")
        XCTAssertTrue(try store.names().isEmpty)
        XCTAssertThrowsError(try store.read(name: "fixture"))
        XCTAssertThrowsError(try store.remove(name: "fixture"))
        let keyStore = try KeychainVaultKeys(keychain: keychain, prefix: "localotp:test:" + UUID().uuidString, allowAuthenticationUI: false)
        let vault = VaultStore(directory: directory.appendingPathComponent("vault"), keys: keyStore)
        try vault.add(name: "vault-fixture", record: record)
        XCTAssertEqual(try vault.names(), ["vault-fixture"])
        let decrypted = try vault.read(name: "vault-fixture")
        XCTAssertTrue(decrypted.secret == record.secret, "Vault fixture mismatch; values redacted")
        try vault.remove(name: "vault-fixture")
        XCTAssertTrue(try vault.names().isEmpty)
    }
}
