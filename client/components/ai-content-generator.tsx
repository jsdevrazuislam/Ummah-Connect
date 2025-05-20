"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react"

export function AIContentGenerator() {
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState("post")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const handleGenerate = () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedContent("")

    // Simulate AI generation
    setTimeout(() => {
      let content = ""

      if (contentType === "post") {
        content = generatePost(prompt)
      } else if (contentType === "dua") {
        content = generateDua(prompt)
      } else if (contentType === "quote") {
        content = generateQuote(prompt)
      }

      setGeneratedContent(content)
      setIsGenerating(false)
    }, 2000)
  }

  const generatePost = (prompt: string) => {
    const postTemplates = [
      `Alhamdulillah for the blessing of ${prompt}. It reminds us of Allah's infinite mercy and wisdom. What are your thoughts on this topic, brothers and sisters?`,
      `I've been reflecting on ${prompt} lately. The Prophet Muhammad ﷺ taught us that seeking knowledge is an obligation upon every Muslim. Let's discuss what we can learn from this.`,
      `"Verily, with hardship comes ease." (Quran 94:5-6) This verse has been a comfort when dealing with ${prompt}. How has the Quran guided you through similar situations?`,
      `Today I learned about ${prompt} from an Islamic perspective. It's amazing how our faith provides guidance on every aspect of life. Has anyone else studied this topic?`,
      `Brothers and sisters, I'm seeking advice regarding ${prompt}. What does Islamic teaching tell us about this matter? JazakAllah khair for your insights.`,
    ]

    return postTemplates[Math.floor(Math.random() * postTemplates.length)]
  }

  const generateDua = (prompt: string) => {
    const duaTemplates = [
      `"O Allah, grant me strength and patience in dealing with ${prompt}. You are the Most Merciful, the Most Compassionate."`,
      `"Ya Allah, guide me to what is best regarding ${prompt}. You are the All-Knowing, the All-Wise."`,
      `"O Allah, I seek Your help in understanding ${prompt}. Make what is difficult easy, and what is far, near."`,
      `"Allah, I place my trust in You concerning ${prompt}. You are sufficient for me, and You are the Best Disposer of affairs."`,
      `"O Allah, bless me with beneficial knowledge about ${prompt} and protect me from knowledge that does not benefit."`,
    ]

    return duaTemplates[Math.floor(Math.random() * duaTemplates.length)]
  }

  const generateQuote = (prompt: string) => {
    const quoteTemplates = [
      `"The believer's attitude towards ${prompt} should be one of gratitude and reflection." - Islamic Wisdom`,
      `"When facing challenges with ${prompt}, remember that Allah does not burden a soul beyond what it can bear." (Quran 2:286)`,
      `"The Prophet Muhammad ﷺ said: 'Whoever follows a path to seek knowledge about ${prompt}, Allah will make easy for him the path to Paradise.'" (Adapted from Hadith)`,
      `"True success is not measured by ${prompt}, but by one's relationship with Allah and good deeds." - Islamic Perspective`,
      `"Patience with ${prompt} is half of faith." (Inspired by Hadith)`,
    ]

    return quoteTemplates[Math.floor(Math.random() * quoteTemplates.length)]
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="post" value={contentType} onValueChange={setContentType}>
          <TabsList className="w-full">
            <TabsTrigger value="post" className="flex-1">
              Post
            </TabsTrigger>
            <TabsTrigger value="dua" className="flex-1">
              Dua
            </TabsTrigger>
            <TabsTrigger value="quote" className="flex-1">
              Quote
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Input
            placeholder={
              contentType === "post"
                ? "What topic would you like to post about?"
                : contentType === "dua"
                  ? "What would you like to make dua for?"
                  : "What topic would you like a quote about?"
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {contentType === "post" ? "Post" : contentType === "dua" ? "Dua" : "Quote"}
              </>
            )}
          </Button>
        </div>

        {generatedContent && (
          <div className="space-y-2">
            <div className="bg-muted p-3 rounded-md relative">
              <Textarea
                value={generatedContent}
                readOnly
                className="bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={5}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-background/50 backdrop-blur-sm"
                onClick={handleCopy}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={() => setGeneratedContent("")}>
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
