import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Users, Plus } from "lucide-react"
import Link from "next/link"

// Mock groups data
const recommendedGroups = [
  {
    id: "1",
    name: "Islamic Finance Network",
    description: "Discussing halal investments, sukuk, and Islamic banking principles",
    members: 3245,
    image: "/placeholder.svg?height=100&width=100",
    isJoined: false,
  },
  {
    id: "2",
    name: "Quran Study Circle",
    description: "Weekly Quran tafsir and memorization tips",
    members: 5678,
    image: "/placeholder.svg?height=100&width=100",
    isJoined: false,
  },
  {
    id: "3",
    name: "Muslim Professionals",
    description: "Networking and career advice for Muslim professionals",
    members: 2134,
    image: "/placeholder.svg?height=100&width=100",
    isJoined: true,
  },
]

const yourGroups = [
  {
    id: "3",
    name: "Muslim Professionals",
    description: "Networking and career advice for Muslim professionals",
    members: 2134,
    image: "/placeholder.svg?height=100&width=100",
    isJoined: true,
    unread: 5,
  },
  {
    id: "4",
    name: "Islamic Architecture Appreciation",
    description: "Sharing and discussing beautiful Islamic architecture from around the world",
    members: 1876,
    image: "/placeholder.svg?height=100&width=100",
    isJoined: true,
    unread: 0,
  },
  {
    id: "5",
    name: "Halal Foodies",
    description: "Sharing halal recipes, restaurant recommendations, and food tips",
    members: 4532,
    image: "/placeholder.svg?height=100&width=100",
    isJoined: true,
    unread: 12,
  },
]

export default function GroupsPage() {
  return (
      <>
        <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold ml-12 lg:ml-0">Groups</h1>
            <Link href="/groups/create">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Create Group</span>
              </Button>
            </Link>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search groups" className="pl-10" />
          </div>
          <Tabs defaultValue="your-groups" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="your-groups" className="flex-1">
                Your Groups
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex-1">
                Discover
              </TabsTrigger>
              <TabsTrigger value="invites" className="flex-1">
                Invites
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yourGroups.map((group) => (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <div className="relative">
                        <img
                          src={group.image || "/placeholder.svg"}
                          alt={group.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        {group.unread > 0 && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {group.unread}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{group.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{group.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{group.members.toLocaleString()} members</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <h2 className="text-lg font-medium mt-6 mb-3">Recommended Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedGroups
              .filter((group) => !group.isJoined)
              .map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <img
                        src={group.image || "/placeholder.svg"}
                        alt={group.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{group.name}</h3>
                          <Button size="sm" variant="outline">
                            Join
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{group.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{group.members.toLocaleString()} members</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </>
  )
}
