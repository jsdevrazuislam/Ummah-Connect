"use client"

import type React from "react"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CreateGroupPage() {
  const router = useRouter()
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [privacy, setPrivacy] = useState("public")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would create the group via an API call
    // For now, we'll just redirect to the groups page
    router.push("/groups")
  }

  return (
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/groups"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-6">Create a New Group</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Details</CardTitle>
                <CardDescription>Provide information about your new group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-description">Description</Label>
                  <Textarea
                    id="group-description"
                    placeholder="What is this group about?"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Privacy</Label>
                  <RadioGroup value={privacy} onValueChange={setPrivacy} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="font-normal">
                        Public - Anyone can see the group, its members and their posts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="font-normal">
                        Private - Only members can see posts, but anyone can find the group
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hidden" id="hidden" />
                      <Label htmlFor="hidden" className="font-normal">
                        Hidden - Only members can find the group and see posts
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Media</CardTitle>
                <CardDescription>Upload images for your group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Group Profile Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Upload a profile image for your group</p>
                      <Button type="button" variant="outline" size="sm">
                        Select Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Group Cover Photo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Upload a cover photo for your group</p>
                      <Button type="button" variant="outline" size="sm">
                        Select Image
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Settings</CardTitle>
                <CardDescription>Control how people join your group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Who can approve member requests?</Label>
                  <RadioGroup defaultValue="admins" className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admins" id="admins" />
                      <Label htmlFor="admins" className="font-normal">
                        Only admins
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admins-moderators" id="admins-moderators" />
                      <Label htmlFor="admins-moderators" className="font-normal">
                        Admins and moderators
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Membership approval</Label>
                  <RadioGroup defaultValue="approval" className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approval" id="approval" />
                      <Label htmlFor="approval" className="font-normal">
                        Approve all membership requests
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="automatic" id="automatic" />
                      <Label htmlFor="automatic" className="font-normal">
                        Automatically accept membership requests
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/groups")}>
                Cancel
              </Button>
              <Button type="submit" disabled={!groupName.trim() || !groupDescription.trim()}>
                Create Group
              </Button>
            </div>
          </form>
        </div>
      </main>
  )
}
