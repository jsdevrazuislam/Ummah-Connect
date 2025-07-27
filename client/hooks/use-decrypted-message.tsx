import { useEffect, useState } from "react"
import { getFromIndexedDB } from "@/lib/indexedDB"
import { decryptMessageForBothParties } from "@/lib/e2ee"

const decryptedMessageCache = new Map<string, string>()

export function useDecryptedMessage(
  messageId: string | number | undefined,
  encryptedContent: string | undefined,
  encryptedSymmetricKey: string | undefined
) {
  const [decryptedText, setDecryptedText] = useState<string | null>(null)

  useEffect(() => {
    if (!messageId || !encryptedContent || !encryptedSymmetricKey) return

    if (decryptedMessageCache.has(String(messageId))) {
      setDecryptedText(decryptedMessageCache.get(String(messageId))!)
      return
    }

    const run = async () => {
      try {
        const privateKey = await getFromIndexedDB<CryptoKey>("privateKey")
        if (!privateKey) {
          setDecryptedText("[Private Key Missing]")
          return
        }

        const decrypted = await decryptMessageForBothParties(
          encryptedContent,
          encryptedSymmetricKey,
          privateKey
        )
        decryptedMessageCache.set(String(messageId), decrypted)
        setDecryptedText(decrypted)
      } catch (err) {
        console.error("Decryption failed:", err)
        setDecryptedText("[Decryption Failed]")
      }
    }

    run()
  }, [messageId, encryptedContent, encryptedSymmetricKey])

  return decryptedText
}
