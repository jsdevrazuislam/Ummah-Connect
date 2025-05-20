"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void
  onImageRemove: () => void
  selectedImage: string | null
}

export function ImageUpload({ onImageSelect, onImageRemove, selectedImage }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server and get a URL back
      // For this demo, we'll create a local object URL
      const imageUrl = URL.createObjectURL(file)
      onImageSelect(imageUrl)

      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />

      <Button type="button" size="icon" variant="ghost" onClick={handleButtonClick}>
        <ImageIcon className="h-5 w-5" />
        <span className="sr-only">Add image</span>
      </Button>

      {selectedImage && (
        <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Selected"
            className="w-full h-auto max-h-[200px] object-cover"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
