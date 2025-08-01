"use client";

import {
  BarChart3,
  Bookmark,
  ChevronRight,
  Cloud,
  CloudRain,
  MapPin,
  Plus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/store";

export function LeftSidebar() {
  const { setIsOpen, hijriDate, user, location } = useStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const quickShortcuts = [
    { icon: Bookmark, label: "Saved Posts", href: "/bookmarks", count: user?.totalBookmarks },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-64 space-y-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <Card>
        <CardContent className="py-4 px-2">
          <Button onClick={() => setIsOpen(true)} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </CardContent>
      </Card>

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
              <div className="text-lg font-bold text-blue-600">{user?.totalPosts ?? 0}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{user?.followersCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{user?.followingCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{user?.totalLikes ?? 0}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            <Zap className="h-4 w-4 mr-2 text-yellow-600" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickShortcuts.map(shortcut => (
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
                {Number(shortcut.count) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {shortcut.count}
                  </Badge>
                )}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {
              location?.condition && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {
                      location?.condition === "Rain" ? <CloudRain className="h-4 w-4 text-blue-500" /> : <Cloud className="h-4 w-4 text-blue-500" />
                    }
                    <span className="text-sm font-medium">{location?.condition}</span>
                  </div>
                  <span className="text-lg font-bold">
                    {location?.temp}
                    °C
                  </span>
                </div>
              )
            }
            {user?.location && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{user?.location}</span>
              </div>
            )}
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
                {" "}
                <br />
                {
                  hijriDate?.hijri && (
                    <>
                      {hijriDate?.hijri?.day}
                      {" "}
                      {hijriDate?.hijri?.weekday?.en}
                      {" "}
                      {hijriDate?.hijri?.month?.en}
                      {" "}
                      {hijriDate?.hijri?.year}
                    </>
                  )
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
