"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bookmark,
  TrendingUp,
  Cloud,
  Zap,
  BarChart3,
  Heart,
  Share,
  Eye,
  Plus,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuthStore } from "@/store/store"

const quickShortcuts = [
  { icon: Bookmark, label: "Saved Posts", href: "/bookmarks", count: 24 },
]

const myStats = {
  posts: 156,
  followers: 1248,
  following: 892,
  likes: 5420,
}


export function LeftSidebar() {
  const weather = {
    temp: 24,
    condition: "Sunny",
    location: "Dhaka, BD",
  }

  const { setIsOpen } = useAuthStore()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-64 space-y-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Quick Create */}
      <Card>
        <CardContent className="py-4 px-2">
          <Button onClick={() => setIsOpen(true)} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </CardContent>
      </Card>

      {/* Personal Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{myStats.posts}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{myStats.followers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{myStats.following}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{myStats.likes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Profile Completion</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Zap className="h-4 w-4 mr-2 text-yellow-600" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickShortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-3">
                <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{shortcut.label}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {shortcut.count}
                </Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Weather & Time Widget */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{weather.condition}</span>
              </div>
              <span className="text-lg font-bold">{weather.temp}°C</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{weather.location}</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-mono">
                {currentTime.toLocaleTimeString("en-US", {
                  hour12: true,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
            Today's Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Profile Views</span>
            </div>
            <span className="text-sm font-semibold">+23</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Likes Received</span>
            </div>
            <span className="text-sm font-semibold">+45</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Share className="h-4 w-4 text-green-500" />
              <span className="text-sm">Shares</span>
            </div>
            <span className="text-sm font-semibold">+12</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
