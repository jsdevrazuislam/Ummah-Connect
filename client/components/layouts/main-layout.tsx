"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Video,
  Bell,
  MessageCircle,
  Bookmark,
  Calendar,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { RightSidebar } from "@/components/right-sidebar"
import { LeftSidebar } from "@/components/left-sidebar"
import { useStore } from "@/store/store"
import { useQueryClient } from "@tanstack/react-query"
import { useConversationStore } from "@/hooks/use-conversation-store"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/shorts", icon: Video, label: "Shorts" },
  { href: "/live", icon: Video, label: "Live" },
]

const moreNavItems = [
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/prayer-times", icon: Calendar, label: "Prayer Times" },
]

interface SocialMediaLayoutProps {
  children: React.ReactNode
}

export function SocialMediaLayout({ children }: SocialMediaLayoutProps) {
  const pathname = usePathname()
  const { logout, user, unreadCount } = useStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const totalUnread = useConversationStore((state) =>
    Object.values(state.unreadCounts).reduce((acc, count) => acc + count, 0)
  );

  const handleLogout = () => {
    queryClient.clear()
    logout()
    router.push("/login")
  }

  const RESERVED_ROUTES = [
    "login", "register", "messages", "settings",
    "prayer-times", "live", "shorts", "profile", "notifications", "bookmarks"
  ]

  const isUsernameProfile = () => {
    if (pathname === "/") return false
    const pathSegments = pathname.replace(/^\/+/, "").split("/")

    return (
      pathSegments.length === 1 &&
      !RESERVED_ROUTES.includes(pathSegments[0])
    )
  }

  const shouldHideLeftSidebar =
    isUsernameProfile() || ["/messages", "/shorts", "/story/create"].includes(pathname) || pathname.startsWith("/shorts") || pathname.startsWith("/profile")

  const shouldHideRightSidebar =
    isUsernameProfile() || ["/messages", "/settings", "/prayer-times", "/story/create"].includes(pathname) || pathname.startsWith("/live") || pathname.startsWith("/profile") || pathname.startsWith("/shorts")

  return (
    <div className="bg-background">
      <header className="sticky px-4 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div >
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-lg md:text-xl font-bold">
                  Ummah Connect
                </h1>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors relative ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                  >
                    <item.icon className="h-6 w-6" />
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center space-x-2 flex-1 justify-end">
              <div className="hidden md:flex items-center space-x-2">
                <ThemeToggle />
                <Link href="/notifications">
                  <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex justify-center items-center">
                      {unreadCount}
                    </Badge>}
                  </Button>
                </Link>

                <Link href="/messages">
                  <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 relative">
                    <MessageCircle className="h-5 w-5" />
                    {totalUnread > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex justify-center items-center">
                      {totalUnread}
                    </Badge>}
                  </Button>
                </Link>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="w-10 h-10 rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {moreNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="h-4 w-4 mr-3" />
                        <span>{item.label}</span>
                        {(item.label === "Notifications" && unreadCount > 0) ||
                          (item.label === "Messages" && totalUnread > 0) ? (
                          <Badge className="ml-auto h-5 w-5 p-0 text-xs flex justify-center items-center">
                            {item.label === "Notifications" ? unreadCount : totalUnread}
                          </Badge>
                        ) : null}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      {user?.avatar && <AvatarImage src={user?.avatar} />}
                      {!user?.avatar && <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        {user?.avatar && <AvatarImage src={user?.avatar} />}
                        {!user?.avatar && <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{user?.username}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        {!shouldHideLeftSidebar && (
          <aside className="hidden lg:block w-64 p-4">
            <LeftSidebar />
          </aside>
        )}

        <main
          className={`flex-1 overflow-hidden pb-16 lg:pb-0 ${!shouldHideLeftSidebar && !shouldHideRightSidebar
            ? "lg:px-4"
            : !shouldHideRightSidebar
              ? "xl:pr-4"
              : !shouldHideLeftSidebar
                ? "lg:pl-4"
                : ""
            }`}
        >
          {children}
        </main>

        {!shouldHideRightSidebar && (
          <aside className="hidden xl:block w-80 py-4 pr-4">
            <RightSidebar />
          </aside>
        )}
      </div>
    </div>
  )
}
