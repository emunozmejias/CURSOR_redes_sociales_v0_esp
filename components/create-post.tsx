"use client"

import type React from "react"

import { useState } from "react"
import { ImageIcon, Send, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPost } from "@/lib/firebase-posts"
import type { User } from "@/lib/firebase-auth"

interface CreatePostProps {
  currentUser: User
  onPostCreated?: () => void
}

export function CreatePost({ currentUser, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setIsSubmitting(true)
    setError("")

    const result = await createPost(
      currentUser.id,
      currentUser.displayName || currentUser.username,
      currentUser.username,
      currentUser.photoURL || "/user-avatar.jpg",
      content.trim(),
      imageUrl.trim() || undefined
    )

    if (result.success) {
      // Resetear el formulario
      setContent("")
      setImageUrl("")
      setShowImageInput(false)
      setSuccess(true)
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
      
      // Notificar al componente padre
      onPostCreated?.()
    } else {
      setError(result.error || "Error al crear la publicación")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-balance">Crear Publicación</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>¡Publicación creada exitosamente!</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Avatar>
                <AvatarImage 
                  src={currentUser.photoURL || "/user-avatar.jpg"} 
                  alt={currentUser.username} 
                />
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="¿Qué estás pensando?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                  maxLength={500}
                />

                <div className="text-xs text-muted-foreground text-right">
                  {content.length}/500 caracteres
                </div>

                {showImageInput && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="url"
                        placeholder="URL de la imagen (https://...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowImageInput(false)
                          setImageUrl("")
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {imageUrl && (
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt="Vista previa"
                          className="w-full rounded-lg object-cover max-h-96"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="gap-2 bg-transparent"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {showImageInput ? "Ocultar imagen" : "Añadir Imagen"}
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={!content.trim() || isSubmitting} 
                    className="gap-2"
                  >
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
