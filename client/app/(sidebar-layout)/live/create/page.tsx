"use client"

import type React from "react"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Video, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateLiveStreamPage() {
  const router = useRouter()
  const [streamTitle, setStreamTitle] = useState("")
  const [streamDescription, setStreamDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")

  const handleStartStream = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would start the stream via an API call
    // For now, we'll just redirect to a mock live stream page
    router.push("/live/new-stream")
  }

  return (
      <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <Link href="/live" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Live
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6">Go Live</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <form onSubmit={handleStartStream} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Stream Details</CardTitle>
                    <CardDescription>Provide information about your live stream</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream-title">Stream Title</Label>
                      <Input
                        id="stream-title"
                        placeholder="Enter a title for your stream"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stream-description">Description</Label>
                      <Textarea
                        id="stream-description"
                        placeholder="What is this stream about?"
                        value={streamDescription}
                        onChange={(e) => setStreamDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="quran">Quran</SelectItem>
                            <SelectItem value="discussion">Discussion</SelectItem>
                            <SelectItem value="art">Art</SelectItem>
                            <SelectItem value="charity">Charity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          placeholder="e.g. Islamic Finance, Halal Investing"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Stream Settings</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="chat-enabled">Enable Chat</Label>
                            <p className="text-sm text-muted-foreground">Allow viewers to chat during your stream</p>
                          </div>
                          <Switch id="chat-enabled" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="save-recording">Save Recording</Label>
                            <p className="text-sm text-muted-foreground">Save this stream for viewers to watch later</p>
                          </div>
                          <Switch id="save-recording" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-followers">Notify Followers</Label>
                            <p className="text-sm text-muted-foreground">Send notification when you go live</p>
                          </div>
                          <Switch id="notify-followers" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => router.push("/live")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!streamTitle.trim()} className="gap-2">
                    <Video className="h-4 w-4" />
                    Start Stream
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Stream Preview</CardTitle>
                  <CardDescription>Preview how your stream will appear</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium line-clamp-1">{streamTitle || "Your Stream Title"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your Name</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{category || "Category"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Stream Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="h-4 w-4" />
                    Configure Stream Settings
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Make sure your camera and microphone are properly set up before starting your stream.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
      </main>
  )
}
