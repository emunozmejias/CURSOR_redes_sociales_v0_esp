"use client"

import type React from "react"
import { useState } from "react"
import { Heart, MessageCircle, Send, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Post } from "@/types/post"
import type { User } from "@/lib/auth"

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onComment: (postId: string, comment: string) => void
  onDelete: (postId: string) => void
  onEdit: (postId: string, newContent: string, newImage?: string) => void
  currentUser: User | null
}

export function PostCard({ post, onLike, onComment, onDelete, onEdit, currentUser }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editImage, setEditImage] = useState(post.image || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isAuthor = currentUser && `@${currentUser.username}` === post.author.username

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentText.trim()) {
      onComment(post.id, commentText)
      setCommentText("")
    }
  }

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(post.id, editContent, editImage)
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    onDelete(post.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar>
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {post.author.username} · {post.timestamp}
            </p>
          </div>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          <p className="text-foreground leading-relaxed">{post.content}</p>
          {post.image && (
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              className="w-full rounded-lg object-cover max-h-96"
            />
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`gap-2 ${post.liked ? "text-accent-coral" : ""}`}
            >
              <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
              <span>{post.likes}</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments.length}</span>
            </Button>
          </div>

          {showComments && (
            <div className="w-full space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              ))}

              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Input
                  placeholder="Escribe un comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!commentText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Publicación</DialogTitle>
            <DialogDescription>Modifica el contenido de tu publicación</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="¿Qué estás pensando?"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-32"
            />
            <Input
              placeholder="URL de imagen (opcional)"
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={!editContent.trim()}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Publicación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
