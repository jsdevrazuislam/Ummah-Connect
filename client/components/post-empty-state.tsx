import { Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FollowingEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="bg-muted/50 p-6 rounded-full mb-4">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">No posts from people you follow</h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        When you follow people, their posts will show up here. Start exploring to discover interesting content!
      </p>
      
      <div className="flex gap-3">
        <Button variant="default">
          <FileText className="h-4 w-4 mr-2" />
          Explore Posts
        </Button>
        <Button variant="outline">
          Find People to Follow
        </Button>
      </div>
    </div>
  )
}