export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  return Buffer.from(exported).toString("base64");
}


export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const binaryDer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

export async function encryptWithPublicKey(publicKey: CryptoKey, data: ArrayBuffer) {
  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptWithPrivateKey(encryptedBase64: string, privateKey: CryptoKey) {
  try {
    const binary = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    return await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, binary);
  } catch (err) {
    console.error("decryptWithPrivateKey failed:", err);
    throw err;
  }
}
export async function decryptWithSymmetricKey(encryptedBase64: string, rawKeyBuffer: ArrayBuffer) {
  const data = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const encryptedContent = data.slice(12);

  const symmetricKey = await crypto.subtle.importKey(
    "raw",
    rawKeyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, symmetricKey, encryptedContent);
  return new TextDecoder().decode(decrypted);
}

export async function encryptMessageForBothParties(
  message: string,
  senderPublicKey: CryptoKey,
  recipientPublicKey: CryptoKey
) {
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = new TextEncoder().encode(message);

  const encryptedContent = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encodedMessage);
  const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedContent), iv.length);
  const encryptedMessageBase64 = btoa(String.fromCharCode(...combined));

  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  const key_for_sender = await encryptWithPublicKey(senderPublicKey, rawKey);
  const key_for_recipient = await encryptWithPublicKey(recipientPublicKey, rawKey);

  return {
    content: encryptedMessageBase64,
    key_for_sender,
    key_for_recipient,
  };
}

export async function decryptMessageForBothParties(
  encryptedContent: string,
  encryptedSymmetricKey: string,
  privateKey: CryptoKey
) {
  const rawKeyBuffer = await decryptWithPrivateKey(encryptedSymmetricKey, privateKey);
  return await decryptWithSymmetricKey(encryptedContent, rawKeyBuffer);
}
