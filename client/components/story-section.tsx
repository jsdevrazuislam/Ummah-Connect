"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { StoryViewer } from "@/components/story-viewer"
import { useStore } from "@/store/store"
import { useRouter } from "next/navigation"


export function StorySection() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null)
  const { user, stories: storiesData } = useStore()
  const router = useRouter()

  const stories = storiesData ?? []


  const handleStoryClick = (index: number) => {
    setActiveStoryIndex(index)
  }

  const handleCloseStory = () => {
    setActiveStoryIndex(null)
  }

  return (
    <>
      <div className="px-4 py-3 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          <div
            className="flex flex-col items-center space-y-1 min-w-[72px] flex-shrink-0">
            <div className="rounded-full p-[2px] cursor-pointer" onClick={() => router.push('/story/create')}>
              <div className="bg-background rounded-full p-[2px]">
                <Avatar className="h-16 w-16 relative">
                  {user?.avatar ? <AvatarImage src={user?.avatar} alt={user?.full_name} /> :
                    <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>}
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                </Avatar>
              </div>
            </div>
            <span className="text-xs truncate w-full text-center">
              Your Story
            </span>
          </div>
          {stories && stories?.map((story, index) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 min-w-[72px] flex-shrink-0"
              onClick={() => handleStoryClick(index)}
            >
              <div
                className="rounded-full p-[2px] cursor-pointer bg-gradient-to-tr from-amber-500 to-primary"
              >
                <div className="bg-background rounded-full p-[2px]">
                  <Avatar className="h-16 w-16 relative">
                    {story?.avatar ? <AvatarImage src={story?.avatar} alt={story?.full_name} /> : 
                    <AvatarFallback>{story?.full_name?.charAt(0)}</AvatarFallback>}
                  </Avatar>
                </div>
              </div>
              <span className="text-xs truncate w-full text-center">
                {story?.full_name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {activeStoryIndex !== null && <StoryViewer story={stories[activeStoryIndex]} onClose={handleCloseStory} />}
    </>
  )
}
