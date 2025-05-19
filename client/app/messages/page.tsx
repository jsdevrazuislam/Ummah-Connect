"use client"

import type React from "react"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"

// Mock conversations
const conversations = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
const initialMessages = [
  {
    id: 1,
    sender: "them",
    content: "Assalamu alaikum! How are you doing today?",
    time: "10:30 AM",
    status: "read",
  },
  {
    id: 2,
    sender: "me",
    content: "Wa alaikum assalam! Alhamdulillah, I'm doing well. How about you?",
    time: "10:32 AM",
    status: "read",
  },
  {
    id: 3,
    sender: "them",
    content: "Alhamdulillah, all good. I wanted to ask you about the Islamic book club meeting this weekend.",
    time: "10:35 AM",
    status: "read",
  },
  {
    id: 4,
    sender: "me",
    content:
      "Yes, it's scheduled for Saturday after Asr prayer at the community center. We'll be discussing 'Reclaim Your Heart' by Yasmin Mogahed.",
    time: "10:40 AM",
    status: "read",
  },
  {
    id: 5,
    sender: "them",
    content: "JazakAllah Khair for the information!",
    time: "10:42 AM",
    status: "read",
  },
]

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [messages, setMessages] = useState(initialMessages)
  const [messageText, setMessageText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showCallModal, setShowCallModal] = useState<"audio" | "video" | null>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: "me",
        content: messageText,
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        status: "sent",
      }
      setMessages([...messages, newMessage])
      setMessageText("")

      // Simulate reply after a delay
      setTimeout(() => {
        const replyMessage = {
          id: Date.now() + 1,
          sender: "them",
          content: "Thanks for letting me know! I'll be there insha'Allah.",
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          status: "delivered",
        }
        setMessages((prevMessages) => [...prevMessages, replyMessage])
      }, 3000)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const startCall = (type: "audio" | "video") => {
    setShowCallModal(type)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <div className="flex-1 flex">{/* Conversation list and message display area here */}</div>
    </div>
  )
}
