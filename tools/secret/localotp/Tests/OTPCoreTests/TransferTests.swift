import Foundation
import XCTest
@testable import OTPCore

final class TransferTests: XCTestCase {
    func testPrivatePipePayloadIsBoundedAndValidated() throws {
        let data = Data("{\"label\":\"example fixture\",\"secret\":\"GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ\"}".utf8)
        let record = try ExtensionTransfer.decodePrivatePipe(data)
        XCTAssertTrue(record.secret == Data("12345678901234567890".utf8), "Fixture mismatch; values redacted")
        XCTAssertThrowsError(try ExtensionTransfer.decodePrivatePipe(Data("{\"label\":\"example\",\"secret\":\"invalid!\"}".utf8)))
        XCTAssertThrowsError(try ExtensionTransfer.decodePrivatePipe(Data(repeating: 32, count: 16385)))
        XCTAssertThrowsError(try ExtensionTransfer.decodePrivatePipe(Data("[]".utf8)))
    }
    func testWebCryptoExportImportsWithCommonCryptoAndCryptoKit() throws {
        guard let path = ProcessInfo.processInfo.environment["LOCALOTP_TRANSFER_FIXTURE"] else {
            throw XCTSkip("Run scripts/test.sh for the Web Crypto interoperability fixture")
        }
        let data = try ExtensionTransfer.readFile(path: path)
        let record = try ExtensionTransfer.decrypt(data, password: "public-fixture-password-only")
        XCTAssertTrue(record.secret == Data("12345678901234567890".utf8), "Public fixture mismatch; values redacted")
        XCTAssertTrue(try OTP.code(secret: record.secret, time: 59, parameters: record.parameters) == "287082")
        XCTAssertThrowsError(try ExtensionTransfer.decrypt(data, password: "incorrect-fixture-password"))
        var envelope = try XCTUnwrap(JSONSerialization.jsonObject(with: data) as? [String: Any])
        var ciphertext = try XCTUnwrap(Data(base64Encoded: envelope["ciphertext"] as! String))
        ciphertext[ciphertext.count - 1] ^= 1
        envelope["ciphertext"] = ciphertext.base64EncodedString()
        let tampered = try JSONSerialization.data(withJSONObject: envelope)
        XCTAssertThrowsError(try ExtensionTransfer.decrypt(tampered, password: "public-fixture-password-only"))
        envelope["iterations"] = 1
        XCTAssertThrowsError(try ExtensionTransfer.validate(JSONSerialization.data(withJSONObject: envelope)))
        XCTAssertThrowsError(try ExtensionTransfer.validate(Data("[]".utf8)))
    }
}
