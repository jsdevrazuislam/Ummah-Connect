"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SideNav } from "@/components/side-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Send, Phone, Video, Info, ImageIcon, Paperclip, Smile, Mic } from "lucide-react"
import { CallModal } from "@/components/call-modal"
import Link from "next/link"

// Mock conversations
const conversations = [
  {
    id: "1",
    user: {
      name: "Aisha Rahman",
      username: "aisha_r",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    lastMessage: "JazakAllah Khair for the information!",
    time: "2m",
    unread: 2,
  },
  {
    id: "2",
    user: {
      name: "Ibrahim Khan",
      username: "ibrahim_k",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
    lastMessage: "Are you going to the Islamic conference next week?",
    time: "1h",
    unread: 0,
  },
  {
    id: "3",
    user: {
      name: "Yusuf Islam",
      username: "yusuf_i",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    lastMessage: "I'll share the resources about Islamic finance with you.",
    time: "3h",
    unread: 0,
  },
]

// Mock messages for the active conversation
const mockMessages = {
  "1": [
    {
      id: "1",
      sender: "them",
      content: "Assalamu alaikum! How are you doing today?",
      time: "10:30 AM",
      status: "read",
    },
    {
      id: "2",
      sender: "me",
      content: "Wa alaikum assalam! Alhamdulillah, I'm doing well. How about you?",
      time: "10:32 AM",
      status: "read",
    },
    {
      id: "3",
      sender: "them",
      content: "Alhamdulillah, all good. I wanted to ask you about the Islamic book club meeting this weekend.",
      time: "10:35 AM",
      status: "read",
    },
    {
      id: "4",
      sender: "me",
      content:
        "Yes, it's scheduled for Saturday after Asr prayer at the community center. We'll be discussing 'Reclaim Your Heart' by Yasmin Mogahed.",
      time: "10:40 AM",
      status: "read",
    },
    {
      id: "5",
      sender: "them",
      content: "JazakAllah Khair for the information!",
      time: "10:42 AM",
      status: "read",
    },
  ],
  "2": [
    {
      id: "1",
      sender: "them",
      content: "Assalamu alaikum brother, are you going to the Islamic conference next week?",
      time: "Yesterday, 3:30 PM",
      status: "read",
    },
    {
      id: "2",
      sender: "me",
      content: "Wa alaikum assalam! Yes, I'm planning to attend. Are you going as well?",
      time: "Yesterday, 4:15 PM",
      status: "read",
    },
    {
      id: "3",
      sender: "them",
      content: "Yes, I'll be there. I heard Sheikh Yasir Qadhi will be speaking. Looking forward to it!",
      time: "Yesterday, 4:20 PM",
      status: "read",
    },
  ],
  "3": [
    {
      id: "1",
      sender: "them",
      content: "Assalamu alaikum! I found some great resources on Islamic finance that I think you'll find useful.",
      time: "Monday, 2:15 PM",
      status: "read",
    },
    {
      id: "2",
      sender: "me",
      content: "Wa alaikum assalam! That would be very helpful, JazakAllah Khair in advance.",
      time: "Monday, 2:30 PM",
      status: "read",
    },
    {
      id: "3",
      sender: "them",
      content: "I'll share the resources about Islamic finance with you.",
      time: "Monday, 3:45 PM",
      status: "read",
    },
  ],
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages[params.id as keyof typeof mockMessages] || [])
  const [activeCall, setActiveCall] = useState<{ type: "audio" | "video" } | null>(null)
  const [incomingCall, setIncomingCall] = useState<{ type: "audio" | "video" } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversation = conversations.find((c) => c.id === params.id) || conversations[0]

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Simulate incoming call after a delay
    const callTimer = setTimeout(() => {
      if (Math.random() > 0.7 && !activeCall && !incomingCall) {
        setIncomingCall({ type: Math.random() > 0.5 ? "audio" : "video" })
      }
    }, 30000) // 30 seconds

    return () => clearTimeout(callTimer)
  }, [activeCall, incomingCall])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: "me",
        content: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const startCall = (type: "audio" | "video") => {
    setActiveCall({ type })
  }

  const handleCloseCall = () => {
    setActiveCall(null)
    setIncomingCall(null)
  }

  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      setActiveCall(incomingCall)
      setIncomingCall(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <div className="flex-1 flex">
        {/* Conversations list */}
        <div className="w-full md:w-80 border-r border-border">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages" className="pl-10" />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-130px)]">
            {conversations.map((conv) => (
              <Link href={`/messages/${conv.id}`} key={conv.id}>
                <div
                  className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer ${
                    conv.id === params.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.user.avatar || "/placeholder.svg"} alt={conv.user.name} />
                        <AvatarFallback>{conv.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conv.user.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">{conv.user.name}</span>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active conversation */}
        <div className="hidden md:flex flex-col flex-1">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} alt={conversation.user.name} />
                <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{conversation.user.name}</div>
                <div className="text-xs text-muted-foreground">{conversation.user.online ? "Online" : "Offline"}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => startCall("audio")}>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => startCall("video")}>
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                {message.sender !== "me" && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} alt={conversation.user.name} />
                    <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span
                      className={`text-xs ${
                        message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {message.time}
                    </span>
                    {message.sender === "me" && (
                      <span className="text-xs text-primary-foreground/70">
                        {message.status === "sent" ? "✓" : message.status === "delivered" ? "✓✓" : "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="shrink-0">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              {message.trim() ? (
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="icon" className="shrink-0">
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </form>
          </div>
        </div>

        {/* Empty state for mobile */}
        <div className="flex-1 flex items-center justify-center md:hidden">
          <div className="text-center p-4">
            <h3 className="font-medium">Select a conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations</p>
          </div>
        </div>
      </div>

      {/* Call modals */}
      {activeCall && <CallModal user={conversation.user} callType={activeCall.type} onClose={handleCloseCall} />}

      {incomingCall && (
        <CallModal user={conversation.user} callType={incomingCall.type} onClose={handleCloseCall} incoming={true} />
      )}
    </div>
  )
}
