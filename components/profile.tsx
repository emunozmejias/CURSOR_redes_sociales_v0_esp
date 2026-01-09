"use client"

import { useState, useEffect } from "react"
import { Edit2, MapPin, Calendar, LinkIcon, Mail, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PostCard } from "@/components/post-card"
import { useAuth } from "@/lib/auth-context"
import { getUserPosts, toggleLike, addComment, deletePost, updatePost } from "@/lib/firebase-posts"
import type { Post } from "@/types/post"

export function Profile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [editForm, setEditForm] = useState({
    bio: "",
    location: "",
    website: "",
  })

  // Cargar publicaciones del usuario
  useEffect(() => {
    async function loadUserPosts() {
      if (user) {
        setLoading(true)
        const userPosts = await getUserPosts(user.id)
        // Marcar los posts que el usuario ha dado like
        const postsWithLikeStatus = userPosts.map((post) => ({
          ...post,
          liked: post.likedBy?.includes(user.id) || false,
        }))
        setPosts(postsWithLikeStatus)
        setLoading(false)
      }
    }

    loadUserPosts()
  }, [user])

  // Inicializar formulario de edición con datos del usuario
  useEffect(() => {
    if (user) {
      setEditForm({
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile(editForm)
    
    if (result.success) {
      setIsEditing(false)
    }
    
    setSaving(false)
  }

  const handleLike = async (postId: string) => {
    if (!user) return

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

    await toggleLike(postId, user.id)
  }

  const handleComment = async (postId: string, comment: string) => {
    if (!user) return

    const result = await addComment(
      postId,
      user.id,
      user.displayName || user.username,
      comment
    )

    if (result.success) {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: result.commentId || `temp-${Date.now()}`,
                  author: user.displayName || user.username,
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
    if (!user) return

    const result = await deletePost(postId, user.id)

    if (result.success) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    }
  }

  const handleEdit = async (postId: string, newContent: string, newImage?: string) => {
    if (!user) return

    const result = await updatePost(postId, user.id, {
      content: newContent,
      image: newImage,
    })

    if (result.success) {
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

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarFallback className="text-3xl">?</AvatarFallback>
              </Avatar>
            </div>
            <h2 className="text-2xl font-bold mb-2">Perfil de Usuario</h2>
            <p className="text-muted-foreground mb-6">Inicia sesión para ver y editar tu perfil</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-accent-blue to-accent-teal" />
          {!isEditing && (
            <Button size="sm" onClick={() => setIsEditing(true)} className="absolute top-4 right-4 gap-2">
              <Edit2 className="h-4 w-4" />
              Editar Perfil
            </Button>
          )}
        </div>

        <CardHeader className="relative pt-0">
          <Avatar className="h-24 w-24 border-4 border-card -mt-12">
            <AvatarImage src={user.photoURL || "/user-avatar.jpg"} alt={user.username} />
            <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Biografía</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ubicación</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Ciudad, País"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sitio web</label>
                <Input 
                  value={editForm.website} 
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} 
                  placeholder="ejemplo.com"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-balance">{user.displayName || user.username}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {user.bio && (
                <p className="text-foreground leading-relaxed">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a 
                      href={user.website.startsWith("http") ? user.website : `https://${user.website}`} 
                      className="hover:text-accent-blue transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Se unió en {joinDate}</span>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-foreground">{posts.length}</span>
                  <span className="text-muted-foreground ml-1">Publicaciones</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4">Tus Publicaciones</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando publicaciones...</span>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Tus publicaciones aparecerán aquí una vez que crees algunas.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onDelete={handleDelete}
                onEdit={handleEdit}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
