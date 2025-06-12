"use client"

import { useState } from "react"
import { Search, X, Users, Camera } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const contacts = [
  { id: 1, name: "Sarah Johnson", username: "@sarahj", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Mike Chen", username: "@mikechen", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Emma Wilson", username: "@emmaw", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Alex Rivera", username: "@alexr", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Maya Patel", username: "@mayap", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 6, name: "David Kim", username: "@davidk", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 7, name: "Lisa Zhang", username: "@lisaz", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 8, name: "Tom Brown", username: "@tomb", avatar: "/placeholder.svg?height=40&width=40" },
]

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [step, setStep] = useState(1)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleCreateGroup = () => {
    // Create group logic here
    console.log("Creating group:", { groupName, groupDescription, selectedMembers })
    onOpenChange(false)
    setStep(1)
    setGroupName("")
    setGroupDescription("")
    setSelectedMembers([])
    setSearchQuery("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setStep(1)
    setGroupName("")
    setGroupDescription("")
    setSelectedMembers([])
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {step === 1 ? "Add Members" : "Group Details"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <>
            {/* Step 1: Select Members */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {selectedMembers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selected Members ({selectedMembers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((memberId) => {
                      const member = contacts.find((c) => c.id === memberId)
                      return (
                        <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                          {member?.name}
                          <button
                            onClick={() => handleMemberToggle(memberId)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                      <Checkbox
                        checked={selectedMembers.includes(contact.id)}
                        onCheckedChange={() => handleMemberToggle(contact.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)} disabled={selectedMembers.length === 0}>
                Next ({selectedMembers.length})
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Step 2: Group Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <Button size="sm" className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0">
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="Enter group name..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="groupDescription">Description (Optional)</Label>
                <Input
                  id="groupDescription"
                  placeholder="What's this group about?"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Members ({selectedMembers.length + 1})</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-accent/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">You</p>
                      <p className="text-xs text-muted-foreground">Admin</p>
                    </div>
                  </div>
                  {selectedMembers.slice(0, 3).map((memberId) => {
                    const member = contacts.find((c) => c.id === memberId)
                    return (
                      <div key={memberId} className="flex items-center space-x-3 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member?.name}</p>
                          <p className="text-xs text-muted-foreground">{member?.username}</p>
                        </div>
                      </div>
                    )
                  })}
                  {selectedMembers.length > 3 && (
                    <p className="text-xs text-muted-foreground px-2">+{selectedMembers.length - 3} more members</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleCreateGroup} disabled={!groupName.trim()}>
                Create Group
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
