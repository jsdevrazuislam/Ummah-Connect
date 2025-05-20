"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Loader2 } from "lucide-react"

interface AITranslationProps {
  originalText: string
  originalLanguage?: string
}

export function AITranslation({ originalText, originalLanguage = "English" }: AITranslationProps) {
  const [isTranslated, setIsTranslated] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState("Arabic")
  const [translatedText, setTranslatedText] = useState("")

  const languages = ["Arabic", "Urdu", "Turkish", "Malay", "Indonesian", "Bengali", "French", "Spanish", "English"]

  const handleTranslate = () => {
    setIsTranslating(true)

    // Simulate translation API call
    setTimeout(() => {
      // Mock translations based on target language
      const translations: { [key: string]: string } = {
        Arabic: "الحمد لله رب العالمين. هذا نص مترجم باللغة العربية.",
        Urdu: "اللہ کا شکر ہے۔ یہ اردو میں ترجمہ شدہ متن ہے۔",
        Turkish: "Allah'a şükürler olsun. Bu Türkçe'ye çevrilmiş bir metindir.",
        Malay: "Segala puji bagi Allah. Ini adalah teks yang diterjemahkan dalam bahasa Melayu.",
        Indonesian: "Segala puji bagi Allah. Ini adalah teks yang diterjemahkan dalam bahasa Indonesia.",
        Bengali: "আলহামদুলিল্লাহ। এটি বাংলায় অনুবাদ করা পাঠ্য।",
        French: "Louange à Allah. Ceci est un texte traduit en français.",
        Spanish: "Alabado sea Allah. Este es un texto traducido al español.",
        English: originalText,
      }

      setTranslatedText(translations[targetLanguage] || "Translation not available for this language.")
      setIsTranslated(true)
      setIsTranslating(false)
    }, 1500)
  }

  const handleReset = () => {
    setIsTranslated(false)
    setTranslatedText("")
  }

  return (
    <div className="mt-2 text-sm">
      {!isTranslated ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Translate from {originalLanguage}</span>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="h-7 w-[130px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={handleTranslate}
            disabled={isTranslating || targetLanguage === originalLanguage}
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Translating...
              </>
            ) : (
              "Translate"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-muted p-3 rounded-md">
            <p>{translatedText}</p>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Globe className="h-3 w-3 mr-1" />
              <span>Translated to {targetLanguage} by AI</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7" onClick={handleReset}>
            Show original
          </Button>
        </div>
      )}
    </div>
  )
}
