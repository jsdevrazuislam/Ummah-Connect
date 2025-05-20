"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, MoreHorizontal, Send, Pencil, Trash, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CommentReactionPicker, type ReactionType } from "@/components/comment-reaction-picker"
import { AITranslation } from "@/components/ai-translation"
import { Textarea } from "@/components/ui/textarea"

export interface User {
  name: string
  username: string
  avatar: string
}

export interface CommentReply {
  id: string
  user: User
  content: string
  timestamp: string
  reactions?: {
    [key in ReactionType]?: number
  }
  currentUserReaction?: ReactionType
}

export interface Comment {
  id: string
  user: User
  content: string
  timestamp: string
  reactions?: {
    [key in ReactionType]?: number
  }
  currentUserReaction?: ReactionType
  replies?: CommentReply[]
}

interface CommentItemProps {
  comment: Comment
  isReply?: boolean
  onReply?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, content: string) => void
  onReaction?: (commentId: string, reaction: ReactionType) => void
  currentUser?: User
}

export function CommentItem({
  comment,
  isReply = false,
  onReply,
  onDelete,
  onEdit,
  onReaction,
  currentUser,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showTranslation, setShowTranslation] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType>(comment.currentUserReaction || null)

  const isCurrentUserComment = currentUser && comment.user.username === currentUser.username

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText)
      setReplyText("")
      setShowReplyForm(false)
    }
  }

  const handleEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(comment.id, editText)
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(comment.id)
    }
  }

  const handleReaction = (reaction: ReactionType) => {
    setCurrentReaction(reaction)
    if (onReaction) {
      onReaction(comment.id, reaction)
    }
  }

  const getTotalReactions = () => {
    if (!comment.reactions) return 0

    return Object.values(comment.reactions).reduce((sum, count) => sum + (count || 0), 0)
  }

  return (
    <div className={`flex gap-2 ${isReply ? "ml-8 mt-3" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">{comment.user.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              {isCurrentUserComment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1">{comment.content}</p>
          )}
        </div>

        {showTranslation && !isEditing && (
          <div className="mt-2">
            <AITranslation originalText={comment.content} />
          </div>
        )}

        <div className="flex gap-4 mt-1 ml-2">
          <div className="flex items-center gap-1">
            <CommentReactionPicker onReactionSelect={handleReaction} currentReaction={currentReaction} size="sm" />
            {getTotalReactions() > 0 && <span className="text-xs text-muted-foreground">{getTotalReactions()}</span>}
          </div>

          {!isReply && onReply && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>
          )}

          <button
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            <Sparkles className="h-3 w-3" />
            {showTranslation ? "Hide Translation" : "Translate"}
          </button>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3 flex gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={currentUser?.avatar || "/placeholder.svg?height=24&width=24"}
                alt={currentUser?.name || "You"}
              />
              <AvatarFallback>{currentUser?.name?.charAt(0) || "Y"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
              <Button size="sm" className="h-8" onClick={handleReply} disabled={!replyText.trim()}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Show/hide replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => setShowReplies(!showReplies)}>
              {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </Button>

            {showReplies && (
              <div className="mt-2 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onReaction={onReaction}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
