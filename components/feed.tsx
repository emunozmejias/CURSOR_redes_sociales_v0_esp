"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/post-card"
import { subscribeToPostsChanges, toggleLike, addComment, deletePost, updatePost } from "@/lib/firebase-posts"
import type { Post } from "@/types/post"
import type { User } from "@/lib/firebase-auth"
import { Loader2 } from "lucide-react"

interface FeedProps {
  currentUser: User | null
}

export function Feed({ currentUser }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Suscribirse a cambios en las publicaciones (tiempo real)
    const unsubscribe = subscribeToPostsChanges((newPosts) => {
      // Marcar los posts que el usuario actual ha dado like
      const postsWithLikeStatus = newPosts.map((post) => ({
        ...post,
        liked: currentUser ? post.likedBy?.includes(currentUser.id) : false,
      }))
      setPosts(postsWithLikeStatus)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  const handleLike = async (postId: string) => {
    if (!currentUser) return

    // Actualizar UI optimistamente
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newLiked = !post.liked
          return {
            ...post,
            liked: newLiked,
            likes: newLiked ? post.likes + 1 : post.likes - 1,
          }
        }
        return post
      })
    )

    // Actualizar en Firebase
    await toggleLike(postId, currentUser.id)
  }

  const handleComment = async (postId: string, comment: string) => {
    if (!currentUser) return

    const result = await addComment(
      postId,
      currentUser.id,
      currentUser.displayName || currentUser.username,
      comment
    )

    if (result.success) {
      // El comentario se actualizará automáticamente vía la suscripción
      // o podemos agregarlo localmente para respuesta inmediata
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: result.commentId || `temp-${Date.now()}`,
                  author: currentUser.displayName || currentUser.username,
                  content: comment,
                  timestamp: "ahora",
                },
              ],
            }
          }
          return post
        })
      )
    }
  }

  const handleDelete = async (postId: string) => {
    if (!currentUser) return

    const result = await deletePost(postId, currentUser.id)

    if (result.success) {
      // El post se eliminará automáticamente vía la suscripción
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    }
  }

  const handleEdit = async (postId: string, newContent: string, newImage?: string) => {
    if (!currentUser) return

    const result = await updatePost(postId, currentUser.id, {
      content: newContent,
      image: newImage,
    })

    if (result.success) {
      // El post se actualizará automáticamente vía la suscripción
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              content: newContent,
              image: newImage || post.image,
            }
          }
          return post
        })
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando publicaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-balance mb-2">Feed de Inicio</h2>
        <p className="text-muted-foreground">Descubre las últimas publicaciones de la comunidad</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No hay publicaciones todavía.</p>
          <p className="text-muted-foreground">¡Sé el primero en compartir algo!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onDelete={handleDelete}
            onEdit={handleEdit}
            currentUser={currentUser}
          />
        ))
      )}
    </div>
  )
}
