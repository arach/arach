// Standard Web Crypto primitives; compatible with CommonCrypto + CryptoKit.
const encoder = new TextEncoder();
const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

export async function encryptTransfer(entry, password) {
  if (typeof entry?.label !== "string" || typeof entry.secret !== "string") throw new Error("Invalid entry");
  const passwordBytes = encoder.encode(password);
  if (passwordBytes.length < 16 || passwordBytes.length > 1024) throw new Error("Invalid transfer password length");
  const secret = entry.secret.replace(/\s/g, "");
  if (secret.length > 4096) throw new Error("Invalid seed length");
  const material = await crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveKey"]);
  passwordBytes.fill(0);
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 600000 }, material,
    { name: "AES-GCM", length: 256 }, false, ["encrypt"]
  );
  const clear = encoder.encode(JSON.stringify({ label: entry.label, secret }));
  try {
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: encoder.encode("LocalOTP extension transfer v1"), tagLength: 128 },
      key, clear
    );
    return { format: "localotp-extension-transfer", version: 1, kdf: "PBKDF2-SHA256",
      iterations: 600000, salt: b64(salt), iv: b64(iv), ciphertext: b64(ciphertext) };
  } finally { clear.fill(0); }
}
