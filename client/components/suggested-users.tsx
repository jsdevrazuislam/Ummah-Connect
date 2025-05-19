import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const suggestedUsers = [
  { id: 1, name: "Yusuf Islam", username: "yusuf_i", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Aisha Rahman", username: "aisha_r", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Ibrahim Khan", username: "ibrahim_k", avatar: "/placeholder.svg?height=40&width=40" },
]

export function SuggestedUsers() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Who to Follow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-muted-foreground">@{user.username}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
