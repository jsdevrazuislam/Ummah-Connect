"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  User,
  Bell,
  MessageCircle,
  Bookmark,
  Settings,
  Compass,
  Calendar,
  Moon,
  Sun,
  Video,
  Users,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/store"

export function SideNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () =>{
    logout()
    router.push("/login")
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/shorts", icon: Video, label: "Shorts" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/live", icon: Video, label: "Live" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
    { href: "/prayer-times", icon: Calendar, label: "Prayer Times" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="sticky top-0 h-screen w-[240px] p-2 flex flex-col justify-between">
      <div className="space-y-2 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Ummah Connect</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <item.icon className="h-5 w-5 mr-2" />
              <span className="inline-flex">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
         <Button className=" flex justify-center items-center" onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
