"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, ImageIcon, Type, Send } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StoryCreatorProps {
  onClose: () => void
  onCreateStory: (content: string, type: "image" | "text") => void
}

export function StoryCreator({ onClose, onCreateStory }: StoryCreatorProps) {
  const [storyType, setStoryType] = useState<"image" | "text">("image")
  const [content, setContent] = useState("")
  const [bgColor, setBgColor] = useState("from-primary to-primary-foreground")

  const handleSubmit = () => {
    if (content.trim()) {
      onCreateStory(content, storyType)
    }
  }

  const colorOptions = [
    "from-primary to-primary-foreground",
    "from-blue-500 to-purple-500",
    "from-amber-500 to-red-500",
    "from-green-500 to-emerald-700",
    "from-rose-400 to-red-500",
  ]

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium">Create Story</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="image" className="p-4" onValueChange={(value) => setStoryType(value as "image" | "text")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Image</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
          </TabsList>

          {storyType === "image" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload an image for your story</p>
                  <Button size="sm">Select Image</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Caption</label>
                <Textarea
                  placeholder="Add a caption to your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {storyType === "text" && (
            <div className="space-y-4">
              <div className={`bg-gradient-to-br ${bgColor} rounded-lg p-6 h-60 flex items-center justify-center`}>
                <Textarea
                  placeholder="Type your story text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-transparent border-none resize-none text-white text-center text-xl placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={5}
                />
              </div>
              <div className="flex gap-2 justify-center">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} ${
                      bgColor === color ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => setBgColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button className="w-full" onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Share Story
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
