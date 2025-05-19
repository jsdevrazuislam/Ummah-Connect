"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { StoryViewer } from "@/components/story-viewer"
import { StoryCreator } from "@/components/story-creator"

// Mock stories data
const mockStories = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Your Story",
      username: "you",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    items: [],
    viewed: false,
    isCurrentUser: true,
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Ahmed Khan",
      username: "ahmed_k",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    items: [
      {
        id: "s1",
        type: "image",
        src: "/placeholder.svg?height=800&width=400",
        caption: "Alhamdulillah for this beautiful day! #blessed",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    viewed: false,
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Fatima Ali",
      username: "fatima_a",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    items: [
      {
        id: "s2",
        type: "image",
        src: "/placeholder.svg?height=800&width=400",
        caption: "At the Islamic conference today",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "s3",
        type: "image",
        src: "/placeholder.svg?height=800&width=400",
        caption: "Learning so much from the speakers!",
        timestamp: new Date(Date.now() - 7000000).toISOString(),
      },
    ],
    viewed: false,
  },
  {
    id: "4",
    user: {
      id: "u4",
      name: "Omar Farooq",
      username: "omar_f",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    items: [
      {
        id: "s4",
        type: "image",
        src: "/placeholder.svg?height=800&width=400",
        caption: "Beautiful mosque architecture",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    viewed: true,
  },
  {
    id: "5",
    user: {
      id: "u5",
      name: "Aisha Rahman",
      username: "aisha_r",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    items: [
      {
        id: "s5",
        type: "image",
        src: "/placeholder.svg?height=800&width=400",
        caption: "Preparing for Ramadan",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
      },
    ],
    viewed: false,
  },
  {
    id: "6",
    user: {
      id: "u6",
      name: "Ibrahim Khan",
      username: "ibrahim_k",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    items: [
      {
        id: "s6",
        type: "image",
        src: "/placeholder.svg?height=800&width=400",
        caption: "New Islamic book recommendation",
        timestamp: new Date(Date.now() - 18000000).toISOString(),
      },
    ],
    viewed: true,
  },
]

export function StorySection() {
  const [stories, setStories] = useState(mockStories)
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)
  const [showStoryCreator, setShowStoryCreator] = useState(false)

  const handleStoryClick = (index: number) => {
    if (index === 0 && stories[0].isCurrentUser) {
      // Click on "Your Story" should open story creator
      setShowStoryCreator(true)
    } else {
      setActiveStoryIndex(index)
    }
  }

  const handleCloseStory = () => {
    setActiveStoryIndex(null)
  }

  const handleCloseStoryCreator = () => {
    setShowStoryCreator(false)
  }

  const handleCreateStory = (content: string, mediaType: "image" | "text") => {
    // In a real app, you would upload the image/content to a server
    // For now, we'll just add it to the current user's stories
    const newStory = {
      id: `new-story-${Date.now()}`,
      type: mediaType,
      src: mediaType === "image" ? "/placeholder.svg?height=800&width=400" : undefined,
      caption: content,
      timestamp: new Date().toISOString(),
    }

    const updatedStories = [...stories]
    if (updatedStories[0].isCurrentUser) {
      updatedStories[0] = {
        ...updatedStories[0],
        items: [...(updatedStories[0].items || []), newStory],
      }
    }

    setStories(updatedStories)
    setShowStoryCreator(false)
  }

  return (
    <>
      <div className="py-4 px-2">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 min-w-[72px]"
              onClick={() => handleStoryClick(index)}
            >
              <div
                className={`rounded-full p-[2px] cursor-pointer ${
                  story.viewed || (story.isCurrentUser && story.items.length === 0)
                    ? "bg-muted"
                    : "bg-gradient-to-tr from-amber-500 to-primary"
                }`}
              >
                <div className="bg-background rounded-full p-[2px]">
                  <Avatar className="h-16 w-16 relative">
                    <AvatarImage src={story.user.avatar || "/placeholder.svg"} alt={story.user.name} />
                    <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
                    {story.isCurrentUser && story.items.length === 0 && (
                      <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                        <Plus className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </Avatar>
                </div>
              </div>
              <span className="text-xs truncate w-full text-center">
                {story.isCurrentUser ? "Your Story" : story.user.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {activeStoryIndex !== null && <StoryViewer story={stories[activeStoryIndex]} onClose={handleCloseStory} />}

      {showStoryCreator && <StoryCreator onClose={handleCloseStoryCreator} onCreateStory={handleCreateStory} />}
    </>
  )
}
