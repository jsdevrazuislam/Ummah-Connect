"use client";

import { LogOut, Play, Settings, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";

const menuItems = [
  {
    title: "My Content",
    url: "/dashboard/my-content",
    icon: Video,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function SocialDashboard() {
  const { user, logout } = useStore();
  const pathname = usePathname();

  return (
    <Sidebar className="w-[210px]">
      <SidebarHeader>
       <Link href="/">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Play className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">CreatorHub</span>
            <span className="truncate text-xs text-muted-foreground">Social Dashboard</span>
          </div>
        </div>
       </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title} className={cn("transition-all duration-300 ease-in-out rounded-2xl hover:bg-primary", { "bg-primary": pathname === item.url })}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={() => logout()}>
          <LogOut />
          Logout
        </Button>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {
                user?.avatar ? <AvatarImage src={user?.avatar} alt={user?.fullName} /> : <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
              }

            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.fullName}</span>
              <span className="truncate text-xs text-muted-foreground">
@
{user?.username}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
