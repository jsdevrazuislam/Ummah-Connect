import { Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FollowingEmptyState() {
  return (
    <div className="flex flex-col items-center mt-28  text-center">
      <div className="bg-muted/50 p-6 rounded-full mb-4">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">No posts from people you follow</h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        When you follow people, their posts will show up here. Start exploring to discover interesting content!
      </p>
      
      <div className="flex gap-3">
        <Link href='/discover-people'>
        <Button variant="default">
          <FileText className="h-4 w-4 mr-2" />
          Explore People to Follow
        </Button>
        </Link>
      </div>
    </div>
  )
}