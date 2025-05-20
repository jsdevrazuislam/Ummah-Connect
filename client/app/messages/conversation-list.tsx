"use client"

import type React from "react"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Phone, Video, Info, Smile, Paperclip, ImageIcon, Send, Mic } from "lucide-react"

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
    {
        id: "4",
        user: {
            name: "Fatima Ali",
            username: "fatima_a",
            avatar: "/placeholder.svg?height=40&width=40",
            online: false,
        },
        lastMessage: "Barakallahu feekum for the reminder about the charity event.",
        time: "1d",
        unread: 0,
    },
    {
        id: "5",
        user: {
            name: "Omar Farooq",
            username: "omar_f",
            avatar: "/placeholder.svg?height=40&width=40",
            online: true,
        },
        lastMessage: "Did you get a chance to read that book I recommended?",
        time: "2d",
        unread: 0,
    },
]

export default function MessagesPage() {
    const [activeConversation, setActiveConversation] = useState(conversations[0])
    const [showMobileConversation, setShowMobileConversation] = useState(false)

    const handleSelectConversation = (conversation: (typeof conversations)[0]) => {
        setActiveConversation(conversation)
        setShowMobileConversation(true)
    }

    return (
        <div className="flex min-h-screen bg-background">
            <SideNav />
            <div className="flex-1 flex">
                <div
                    className={`w-full md:w-80 border-r border-border ${showMobileConversation ? "hidden md:block" : "block"}`}
                >
                    <div className="p-4 border-b border-border">
                        <h1 className="text-xl font-bold mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search messages" className="pl-10" />
                        </div>
                    </div>
                    <div className="overflow-y-auto h-[calc(100vh-130px)]">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer ${activeConversation.id === conv.id ? "bg-muted/50" : ""
                                    }`}
                                onClick={() => handleSelectConversation(conv)}
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
                        ))}
                    </div>
                </div>

                <div className={`flex-1 flex flex-col ${showMobileConversation ? "block" : "hidden md:flex"}`}>
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center p-4">
                            <h3 className="font-medium">Select a conversation</h3>
                            <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
