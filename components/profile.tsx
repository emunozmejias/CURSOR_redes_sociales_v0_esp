"use client"

import { useState } from "react"
import { Edit2, MapPin, Calendar, LinkIcon, Mail } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/lib/auth"

interface ProfileProps {
  currentUser: User | null
}

export function Profile({ currentUser }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    bio: "¡Hola! Me encanta compartir momentos y conectar con personas. 🌟",
    location: "Madrid, España",
    website: "ejemplo.com",
    avatar: "/user-avatar.jpg",
    coverImage: "/abstract-gradient.jpg",
    followers: 0,
    following: 0,
    posts: 0,
  })

  const handleSave = () => {
    setIsEditing(false)
    // Aquí guardarías los cambios en una base de datos real
  }

  if (!currentUser) {
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

  const joinDate = new Date(currentUser.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative">
          <img src={profile.coverImage || "/placeholder.svg"} alt="Cover" className="w-full h-48 object-cover" />
          {!isEditing && (
            <Button size="sm" onClick={() => setIsEditing(true)} className="absolute top-4 right-4 gap-2">
              <Edit2 className="h-4 w-4" />
              Editar Perfil
            </Button>
          )}
        </div>

        <CardHeader className="relative pt-0">
          <Avatar className="h-24 w-24 border-4 border-card -mt-12">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={currentUser.username} />
            <AvatarFallback className="text-2xl">{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </CardHeader>

        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Biografía</label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ubicación</label>
                <Input
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sitio web</label>
                <Input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>Guardar Cambios</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-balance">{currentUser.username}</h2>
                <p className="text-muted-foreground">@{currentUser.username}</p>
              </div>

              <p className="text-foreground leading-relaxed">{profile.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{currentUser.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a href={`https://${profile.website}`} className="hover:text-accent-blue transition-colors">
                      {profile.website}
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
                  <span className="font-bold text-foreground">{profile.followers}</span>
                  <span className="text-muted-foreground ml-1">Seguidores</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">{profile.following}</span>
                  <span className="text-muted-foreground ml-1">Siguiendo</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">{profile.posts}</span>
                  <span className="text-muted-foreground ml-1">Publicaciones</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4">Tus Publicaciones</h3>
        <p className="text-muted-foreground text-center py-8">
          Tus publicaciones aparecerán aquí una vez que crees algunas.
        </p>
      </div>
    </div>
  )
}
