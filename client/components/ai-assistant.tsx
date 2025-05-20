"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, X, Maximize2, Minimize2, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Assalamu alaikum! I'm Nur, your Islamic AI assistant. How can I help you today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isMinimized])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        prayer:
          "Prayer times are calculated based on your location. You can find the daily prayer schedule in the Prayer Times section of the app. Would you like me to help you set up prayer notifications?",
        quran:
          "The Quran is the central religious text of Islam. If you're looking to read or study the Quran, I recommend checking out the Quran section in our app. Would you like recommendations for tafsir resources?",
        halal:
          "Halal refers to what is permissible in Islamic law. For halal food recommendations, you can check our Halal Foodies group. Would you like me to suggest some halal restaurants near you?",
        ramadan:
          "Ramadan is the ninth month of the Islamic calendar and is observed by Muslims worldwide as a month of fasting, prayer, reflection, and community. I can help you prepare for Ramadan with fasting schedules and meal plans.",
        zakat:
          "Zakat is one of the Five Pillars of Islam and refers to giving a portion of one's wealth to charity. I can help calculate your zakat obligation if you provide your assets information.",
        hadith:
          "Hadith are the recorded sayings and actions of Prophet Muhammad ﷺ. Would you like me to share a hadith on a specific topic?",
      }

      let aiResponse =
        "I'm here to help with any questions about Islam or using this app. Feel free to ask about prayer times, Islamic teachings, community events, or app features."

      // Check for keywords in the user's message
      const userMessageLower = userMessage.content.toLowerCase()
      for (const [keyword, response] of Object.entries(responses)) {
        if (userMessageLower.includes(keyword)) {
          aiResponse = response
          break
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button onClick={toggleOpen} className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg" size="icon">
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            "fixed right-4 bottom-4 bg-background border border-border rounded-lg shadow-lg transition-all duration-200 ease-in-out overflow-hidden",
            isMinimized ? "w-60 h-14" : "w-80 sm:w-96 h-[500px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32&text=AI" alt="AI Assistant" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">Nur - Islamic AI Assistant</h3>
                {!isMinimized && <p className="text-xs text-muted-foreground">Ask me anything about Islam</p>}
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleOpen}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="p-3 h-[calc(500px-120px)]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarImage src="/placeholder.svg?height=32&width=32&text=AI" alt="AI Assistant" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src="/placeholder.svg?height=32&width=32&text=AI" alt="AI Assistant" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted max-w-[80%] rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    placeholder="Ask about Islam or app features..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
