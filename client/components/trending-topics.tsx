import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

const trendingTopics = [
  { id: 1, tag: "Ramadan", posts: "2.3K posts" },
  { id: 2, tag: "IslamicFinance", posts: "1.5K posts" },
  { id: 3, tag: "Hajj2023", posts: "1.2K posts" },
  { id: 4, tag: "FridayReminder", posts: "950 posts" },
  { id: 5, tag: "IslamicArt", posts: "820 posts" },
]

export function TrendingTopics() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trendingTopics.map((topic) => (
            <Link key={topic.id} href={`/hashtag/${topic.tag}`} className="block hover:bg-muted p-2 rounded-md">
              <div className="font-medium">#{topic.tag}</div>
              <div className="text-xs text-muted-foreground">{topic.posts}</div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
