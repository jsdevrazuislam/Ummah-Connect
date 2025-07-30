"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Monitor, Smartphone, Tablet, MapPin, Clock, LogOut, Shield, AlertTriangle } from "lucide-react"

interface Session {
  id: string
  device: string
  browser: string
  os: string
  location: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

interface ManageSessionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageSessionsDialog({ open, onOpenChange }: ManageSessionsDialogProps) {
  const [loading, setLoading] = useState<string | null>(null)

  // Mock session data
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Desktop",
      browser: "Chrome 120",
      os: "Windows 11",
      location: "New York, US",
      ip: "192.168.1.100",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "2",
      device: "Mobile",
      browser: "Safari",
      os: "iOS 17",
      location: "New York, US",
      ip: "192.168.1.101",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "3",
      device: "Tablet",
      browser: "Chrome 119",
      os: "Android 14",
      location: "Boston, US",
      ip: "10.0.0.50",
      lastActive: "1 day ago",
      isCurrent: false,
    },
    {
      id: "4",
      device: "Desktop",
      browser: "Firefox 121",
      os: "macOS 14",
      location: "San Francisco, US",
      ip: "172.16.0.10",
      lastActive: "3 days ago",
      isCurrent: false,
    },
  ])

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />
      case "tablet":
        return <Tablet className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  const terminateSession = async (sessionId: string) => {
    setLoading(sessionId)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    setLoading(null)

  }

  const terminateAllOtherSessions = async () => {
    setLoading("all")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSessions((prev) => prev.filter((session) => session.isCurrent))
    setLoading(null)

  }

  const activeSessions = sessions.filter((s) => !s.isCurrent)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Sessions
          </DialogTitle>
          <DialogDescription>Monitor and control your active sessions across all devices</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Session */}
          <div>
            <h3 className="font-medium mb-3">Current Session</h3>
            {sessions
              .filter((s) => s.isCurrent)
              .map((session) => (
                <Card key={session.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600">{getDeviceIcon(session.device)}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {session.browser} on {session.os}
                            </p>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Current
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.lastActive}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">IP: {session.ip}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          <Separator />

          {/* Other Sessions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Other Sessions ({activeSessions.length})</h3>
              {activeSessions.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={loading === "all"}>
                      {loading === "all" ? "Terminating..." : "Terminate All"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Terminate All Other Sessions?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will sign you out of all other devices. You'll need to sign in again on those devices.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={terminateAllOtherSessions}>Terminate All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {activeSessions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No other active sessions</p>
                  <p className="text-sm text-gray-500 mt-1">You're only signed in on this device</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-gray-600">{getDeviceIcon(session.device)}</div>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {session.browser} on {session.os}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.lastActive}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">IP: {session.ip}</p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={loading === session.id}>
                              {loading === session.id ? (
                                "Terminating..."
                              ) : (
                                <>
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Terminate
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Terminate Session?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will sign out this device: {session.browser} on {session.os}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => terminateSession(session.id)}>
                                Terminate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Security Tip</p>
                <p className="text-xs text-blue-700 mt-1">
                  If you see any suspicious sessions or locations you don't recognize, terminate them immediately and
                  change your password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
