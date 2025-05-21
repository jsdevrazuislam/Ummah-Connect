"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ImageUploadProps {
  onImageSelect: (imageUrl: File) => void
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelect(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div>
      <Input
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
    </div>
  )
}
