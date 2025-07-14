"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Bookmark,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Cloud,
  Zap,
  Star,
  MessageSquare,
  ImageIcon,
  Video,
  FileText,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuthStore } from "@/store/store"

const quickShortcuts = [
  { icon: Bookmark, label: "Saved Posts", href: "/bookmarks", count: 24 },
  { icon: Users, label: "My Groups", href: "/groups", count: 8 },
  { icon: Calendar, label: "Events", href: "/events", count: 3 },
  { icon: Star, label: "Favorites", href: "/favorites", count: 12 },
]

const recentActivity = [
  {
    type: "like",
    user: "Sarah Johnson",
    action: "liked your photo",
    time: "2m ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    type: "comment",
    user: "Mike Chen",
    action: "commented on your post",
    time: "5m ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    type: "follow",
    user: "Emma Wilson",
    action: "started following you",
    time: "1h ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const myStats = {
  posts: 156,
  followers: 1248,
  following: 892,
  likes: 5420,
}

const savedCollections = [
  { name: "Photography Tips", count: 15, color: "bg-blue-500" },
  { name: "Tech News", count: 23, color: "bg-green-500" },
  { name: "Islamic Quotes", count: 31, color: "bg-purple-500" },
  { name: "Recipes", count: 8, color: "bg-orange-500" },
]

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
        <CardContent className="p-4">
          <Button onClick={() => setIsOpen(true)} className="w-full mb-3" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="flex flex-col h-16 p-2">
              <ImageIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">Photo</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col h-16 p-2">
              <Video className="h-4 w-4 mb-1" />
              <span className="text-xs">Video</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col h-16 p-2">
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">Story</span>
            </Button>
          </div>
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

      {/* Saved Collections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Bookmark className="h-4 w-4 mr-2 text-indigo-600" />
            Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {savedCollections.map((collection) => (
            <div
              key={collection.name}
              className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${collection.color}`} />
                <span className="text-sm">{collection.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {collection.count}
              </Badge>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full text-xs mt-2">
            <Plus className="h-3 w-3 mr-1" />
            New Collection
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                <AvatarFallback>{activity.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <div className="flex-shrink-0">
                {activity.type === "like" && <Heart className="h-3 w-3 text-red-500" />}
                {activity.type === "comment" && <MessageSquare className="h-3 w-3 text-blue-500" />}
                {activity.type === "follow" && <Users className="h-3 w-3 text-green-500" />}
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full text-xs">
            View All Activity
          </Button>
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
