import Foundation
import XCTest
@testable import OTPCore

final class OTPTests: XCTestCase {
    // Public RFC fixtures only; never replace these with enrolled credentials.
    private let sha1Key = Data("12345678901234567890".utf8)

    func testAllRFC6238Vectors() throws {
        let times: [UInt64] = [59, 1111111109, 1111111111, 1234567890, 2000000000, 20000000000]
        let vectors: [(Algorithm, String, [String])] = [
            (.sha1, "12345678901234567890", ["94287082", "07081804", "14050471", "89005924", "69279037", "65353130"]),
            (.sha256, "12345678901234567890123456789012", ["46119246", "68084774", "67062674", "91819424", "90698825", "77737706"]),
            (.sha512, "1234567890123456789012345678901234567890123456789012345678901234", ["90693936", "25091201", "99943326", "93441116", "38618901", "47863826"])
        ]
        for (algorithm, key, expected) in vectors {
            for (index, time) in times.enumerated() {
                let actual = try OTP.code(secret: Data(key.utf8), time: time,
                                          parameters: Parameters(algorithm: algorithm, digits: 8))
                XCTAssertTrue(actual == expected[index], "RFC 6238 vector mismatch; values redacted")
            }
        }
    }

    func testAllRFC4226Vectors() throws {
        let expected = ["755224", "287082", "359152", "969429", "338314", "254676", "287922", "162583", "399871", "520489"]
        for (counter, value) in expected.enumerated() {
            let actual = try OTP.hotp(secret: sha1Key, counter: UInt64(counter), algorithm: .sha1, digits: 6)
            XCTAssertTrue(actual == value, "RFC 4226 vector mismatch; values redacted")
        }
    }

    func testTimeBoundariesAndWidths() throws {
        let params = try Parameters()
        XCTAssertTrue(try OTP.code(secret: sha1Key, time: 29, parameters: params) ==
                      OTP.hotp(secret: sha1Key, counter: 0, algorithm: .sha1, digits: 6))
        XCTAssertTrue(try OTP.code(secret: sha1Key, time: 30, parameters: params) ==
                      OTP.hotp(secret: sha1Key, counter: 1, algorithm: .sha1, digits: 6))
        for digits in 6...8 {
            let value = try OTP.code(secret: sha1Key, time: UInt64.max,
                                     parameters: Parameters(digits: digits, period: 60))
            XCTAssertTrue(value.count == digits && value.allSatisfy(\.isNumber))
        }
        XCTAssertTrue(try OTP.code(secret: sha1Key, time: 59, parameters: Parameters(digits: 7)) == "4287082")
    }

    func testBase32RFC4648VectorsAndManualFormatting() throws {
        let vectors = [("MY======", "f"), ("MZXQ====", "fo"), ("MZXW6===", "foo"),
                       ("MZXW6YQ=", "foob"), ("MZXW6YTB", "fooba"), ("MZXW6YTBOI======", "foobar")]
        for (encoded, raw) in vectors {
            XCTAssertTrue(try Base32.decode(encoded) == Data(raw.utf8))
            XCTAssertTrue(try Base32.decode(encoded.replacingOccurrences(of: "=", with: "").lowercased()) == Data(raw.utf8))
        }
        XCTAssertTrue(try Base32.decode("mz xw-6ytb") == Data("fooba".utf8))
    }

    func testRejectsMalformedBase32() {
        for invalid in ["", "A", "AAA", "AAAAAA", "MZ", "MY=", "MY=======", "MY======A", "M1", "M0", "M8", "M!", "MY\n", "MÄ", "ß", "========", String(repeating: "A", count: 4097)] {
            XCTAssertThrowsError(try Base32.decode(invalid), "Malformed Base32 must fail")
        }
    }

    func testValidationAndDecodedRecordValidation() throws {
        XCTAssertThrowsError(try Parameters(digits: 5))
        XCTAssertThrowsError(try Parameters(digits: 9))
        XCTAssertThrowsError(try Parameters(period: 0))
        XCTAssertThrowsError(try Parameters(period: 3601))
        XCTAssertThrowsError(try AccountRecord(secret: Data(repeating: 1, count: 15), parameters: Parameters()))
        for name in ["", " padded", "padded ", "line\nbreak", "line\u{2028}break", "escape\u{1b}", "bidi\u{202e}", "otpauth://totp/x", String(repeating: "a", count: 129)] {
            XCTAssertThrowsError(try AccountRecord.validateName(name))
        }
        XCTAssertNoThrow(try AccountRecord.validateName("Example: alice@example.test"))
        let malformed = Data("{\"version\":1,\"parameters\":{\"algorithm\":\"SHA1\",\"digits\":6,\"period\":0},\"secret\":\"MTIzNDU2Nzg5MDEyMzQ1Njc4OTA=\"}".utf8)
        let decoded = try JSONDecoder().decode(AccountRecord.self, from: malformed)
        XCTAssertThrowsError(try decoded.validate())
    }
}
