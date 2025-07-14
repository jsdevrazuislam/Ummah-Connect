"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldAlert, X } from "lucide-react"

interface AIContentModerationBannerProps {
  postId: number
  content: string
  onReview: (postId: number) => void
  onDismiss: (postId: number) => void
}

export function AIContentModerationBanner({ postId, onReview, onDismiss }: AIContentModerationBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss(postId)
  }

  const handleReview = () => {
    setDismissed(true)
    onReview(postId)
  }

  return (
    <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 mb-4">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Content Notice</AlertTitle>
      <AlertDescription className="mt-1">
        <p className="text-sm">
          Our AI has detected that this content may not align with Islamic values or community guidelines. Please
          review.
        </p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-700" onClick={handleReview}>
            Review Content
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
