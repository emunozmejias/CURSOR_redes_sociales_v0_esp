"use client"

import { PostCard } from "@/components/post-card"
import type { Post } from "@/types/post"
import type { User } from "@/lib/auth"

interface FeedProps {
  posts: Post[]
  onLike: (postId: string) => void
  onComment: (postId: string, comment: string) => void
  onDelete: (postId: string) => void
  onEdit: (postId: string, newContent: string, newImage?: string) => void
  currentUser: User | null
}

export function Feed({ posts, onLike, onComment, onDelete, onEdit, currentUser }: FeedProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-balance mb-2">Feed de Inicio</h2>
        <p className="text-muted-foreground">Descubre las últimas publicaciones de la comunidad</p>
      </div>

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={onEdit}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}
