import { useEffect, useState } from "react";

import { decryptMessageForBothParties } from "@/lib/e2ee";
import { getFromIndexedDB } from "@/lib/index-db";

const decryptedMessageCache = new Map<string, string>();

function generateCacheKey(
  messageId: string | number | undefined,
  encryptedContent: string | undefined,
) {
  return `${messageId}-${encryptedContent?.slice(0, 16)}`;
}

export function useDecryptedMessage(
  messageId: string | number | undefined,
  encryptedContent: string | undefined,
  encryptedSymmetricKey: string | undefined,
) {
  const [decryptedText, setDecryptedText] = useState<string | null>(null);

  useEffect(() => {
    if (!messageId || !encryptedContent || !encryptedSymmetricKey)
      return;

    const cacheKey = generateCacheKey(messageId, encryptedContent);

    if (decryptedMessageCache.has(cacheKey)) {
      setDecryptedText(decryptedMessageCache.get(cacheKey)!);
      return;
    }

    const run = async () => {
      try {
        const privateKey = await getFromIndexedDB<CryptoKey>("privateKey");
        if (!privateKey) {
          setDecryptedText("[Private Key Missing]");
          return;
        }

        const decrypted = await decryptMessageForBothParties(
          encryptedContent,
          encryptedSymmetricKey,
          privateKey,
        );

        decryptedMessageCache.set(cacheKey, decrypted);
        setDecryptedText(decrypted);
      }
      catch (err) {
        console.error("Decryption failed:", err);
        setDecryptedText("[Decryption Failed]");
      }
    };

    run();
  }, [messageId, encryptedContent, encryptedSymmetricKey]);

  return decryptedText;
}
