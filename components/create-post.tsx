"use client"

import type React from "react"

import { useState } from "react"
import { ImageIcon, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Post } from "@/types/post"
import type { User } from "@/lib/auth"

interface CreatePostProps {
  onPostCreated: (post: Post) => void
  currentUser: User
}

export function CreatePost({ onPostCreated, currentUser }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageSelect = () => {
    // En una aplicación real, aquí abrirías un selector de archivos
    const mockImage = "/nature-landscape.jpg"
    setSelectedImage(mockImage)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setIsSubmitting(true)

    // Simulamos una petición a la API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser.username,
        avatar: "/user-avatar.jpg",
        username: `@${currentUser.username}`,
      },
      content,
      image: selectedImage || undefined,
      likes: 0,
      comments: [],
      timestamp: "ahora",
    }

    // Resetear el formulario
    setContent("")
    setSelectedImage(null)
    setIsSubmitting(false)

    onPostCreated(newPost)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-balance">Crear Publicación</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Avatar>
                <AvatarImage src="/user-avatar.jpg" alt={currentUser.username} />
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="¿Qué estás pensando?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />

                {selectedImage && (
                  <div className="relative">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full rounded-lg object-cover max-h-96"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2"
                    >
                      Quitar
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImageSelect}
                    className="gap-2 bg-transparent"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Añadir Imagen
                  </Button>

                  <Button type="submit" disabled={!content.trim() || isSubmitting} className="gap-2">
                    {isSubmitting ? "Publicando..." : "Publicar"}
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 text-foreground">Consejos para crear publicaciones:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Sé auténtico y comparte contenido que te apasione</li>
              <li>• Usa imágenes de alta calidad para mayor engagement</li>
              <li>• Interactúa con los comentarios de tu comunidad</li>
              <li>• Mantén un tono positivo y respetuoso</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
