import CryptoKit
import Darwin
import Foundation
import XCTest
@testable import OTPCore

final class MemoryVaultKeys: VaultKeyStore {
    var values: [String: SymmetricKey] = [:]
    var creates = 0
    func create(id: String, key: SymmetricKey) throws {
        guard values[id] == nil else { throw VaultError.invalid }
        values[id] = key
        creates += 1
    }
    func load(id: String) throws -> SymmetricKey {
        guard let key = values[id] else { throw VaultError.missingKey }
        return key
    }
}

final class VaultTests: XCTestCase {
    private var directory: URL!
    private var keys: MemoryVaultKeys!
    private var vault: VaultStore!
    private var file: URL { directory.appendingPathComponent("vault.json") }

    override func setUpWithError() throws {
        let root = ProcessInfo.processInfo.environment["LOCALOTP_TEST_KEYCHAIN_DIR"]
            ?? FileManager.default.temporaryDirectory.path
        directory = URL(fileURLWithPath: root).appendingPathComponent("vault-fixture-" + UUID().uuidString)
        keys = MemoryVaultKeys()
        vault = VaultStore(directory: directory, keys: keys)
    }
    override func tearDownWithError() throws {
        if FileManager.default.fileExists(atPath: directory.path) {
            try FileManager.default.removeItem(at: directory)
        }
    }
    private func record() throws -> AccountRecord {
        try AccountRecord(secret: Data("12345678901234567890".utf8), parameters: Parameters())
    }
    private func object() throws -> [String: Any] {
        try XCTUnwrap(JSONSerialization.jsonObject(with: Data(contentsOf: file)) as? [String: Any])
    }
    private func write(_ object: [String: Any]) throws {
        try JSONSerialization.data(withJSONObject: object).write(to: file)
    }

    func testEncryptedLifecycleAndReopen() throws {
        XCTAssertTrue(try vault.names().isEmpty)
        XCTAssertEqual(keys.creates, 0)
        try vault.add(name: "example-public-fixture", record: record())
        let bytes = try Data(contentsOf: file)
        let text = String(decoding: bytes, as: UTF8.self)
        XCTAssertFalse(text.contains("example-public-fixture"))
        XCTAssertFalse(text.contains("12345678901234567890"))
        XCTAssertFalse(text.contains(try record().secret.base64EncodedString()))
        XCTAssertEqual(keys.creates, 1)
        let reopened = VaultStore(directory: directory, keys: keys)
        XCTAssertEqual(try reopened.names(), ["example-public-fixture"])
        let stored = try reopened.read(name: "example-public-fixture")
        XCTAssertTrue(try stored.secret == record().secret, "Public fixture mismatch; values redacted")
        XCTAssertTrue(try OTP.code(secret: stored.secret, time: 59, parameters: stored.parameters) == "287082")
        XCTAssertThrowsError(try reopened.add(name: "example-public-fixture", record: record()))
        XCTAssertTrue(try Data(contentsOf: file) == bytes, "Duplicate changed vault")
        try reopened.add(name: "second-fixture", record: record())
        XCTAssertEqual(keys.creates, 1)
        try reopened.remove(name: "example-public-fixture")
        XCTAssertEqual(try reopened.names(), ["second-fixture"])
        try reopened.remove(name: "second-fixture")
        XCTAssertTrue(try reopened.names().isEmpty)
        XCTAssertThrowsError(try reopened.read(name: "second-fixture"))
        let attrs = try FileManager.default.attributesOfItem(atPath: file.path)
        XCTAssertEqual((attrs[.posixPermissions] as? NSNumber)?.intValue, 0o600)
    }

    func testCiphertextTamperingRefusesReadAndMutation() throws {
        try vault.add(name: "fixture", record: record())
        var envelope = try object()
        var records = try XCTUnwrap(envelope["records"] as? [String: String])
        let id = try XCTUnwrap(records.keys.first)
        var data = try XCTUnwrap(Data(base64Encoded: records[id]!))
        data[data.count - 1] ^= 1
        records[id] = data.base64EncodedString()
        envelope["records"] = records
        try write(envelope)
        let corrupted = try Data(contentsOf: file)
        XCTAssertThrowsError(try vault.names())
        XCTAssertThrowsError(try vault.read(name: "fixture"))
        XCTAssertThrowsError(try vault.add(name: "another", record: record()))
        XCTAssertThrowsError(try vault.remove(name: "fixture"))
        XCTAssertTrue(try Data(contentsOf: file) == corrupted)
    }

    func testWrongKeyMissingKeyAndInvalidIndexFailClosed() throws {
        try vault.add(name: "fixture", record: record())
        let original = try Data(contentsOf: file)
        let savedKeys = keys.values
        keys.values = [:]
        XCTAssertThrowsError(try vault.names())
        XCTAssertThrowsError(try vault.add(name: "another", record: record()))
        XCTAssertEqual(keys.creates, 1, "Missing key was silently replaced")
        keys.values = savedKeys.mapValues { _ in SymmetricKey(size: .bits256) }
        XCTAssertThrowsError(try vault.read(name: "fixture"))
        keys.values = savedKeys
        var envelope = try object()
        envelope["index"] = Data(repeating: 0, count: 64).base64EncodedString()
        try write(envelope)
        XCTAssertThrowsError(try vault.names())
        try original.write(to: file)
        envelope = try object()
        envelope["version"] = 99
        try write(envelope)
        XCTAssertThrowsError(try vault.names())
    }

    func testPrivatePermissionsAndSymlinkRefusal() throws {
        try vault.add(name: "fixture", record: record())
        try FileManager.default.setAttributes([.posixPermissions: 0o644], ofItemAtPath: file.path)
        XCTAssertThrowsError(try vault.names())
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
        let target = directory.appendingPathComponent("original.json")
        try FileManager.default.moveItem(at: file, to: target)
        try FileManager.default.createSymbolicLink(at: file, withDestinationURL: target)
        XCTAssertThrowsError(try vault.names())
        XCTAssertThrowsError(try vault.add(name: "another", record: record()))
        try FileManager.default.removeItem(at: file)
        try FileManager.default.moveItem(at: target, to: file)
        try FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: directory.path)
        XCTAssertThrowsError(try vault.names())
    }

    func testConcurrentWriterIsRefusedAndNoTemporaryPlaintextFiles() throws {
        try vault.add(name: "fixture", record: record())
        let lock = open(directory.appendingPathComponent(".lock").path, O_RDWR)
        XCTAssertGreaterThanOrEqual(lock, 0)
        defer { close(lock) }
        XCTAssertEqual(flock(lock, LOCK_EX | LOCK_NB), 0)
        XCTAssertThrowsError(try vault.add(name: "another", record: record())) { error in
            guard case VaultError.busy = error else { return XCTFail("Unexpected lock error") }
        }
        XCTAssertEqual(flock(lock, LOCK_UN), 0)
        XCTAssertEqual(try vault.names(), ["fixture"])
        let files = try FileManager.default.contentsOfDirectory(atPath: directory.path).sorted()
        XCTAssertEqual(files, [".lock", "vault.json"])
    }
}
