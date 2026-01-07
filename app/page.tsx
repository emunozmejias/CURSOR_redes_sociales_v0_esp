"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Feed } from "@/components/feed"
import { Profile } from "@/components/profile"
import { CreatePost } from "@/components/create-post"
import { AuthModal } from "@/components/auth-modal"
import type { Post } from "@/types/post"
import { AuthService, type User } from "@/lib/auth"

const initialPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "María García",
      avatar: "/woman-avatar.png",
      username: "@maria_garcia",
    },
    content: "¡Increíble día explorando la ciudad! La arquitectura aquí es simplemente impresionante 🏛️✨",
    image: "/city-architecture.jpg",
    likes: 142,
    comments: [],
    timestamp: "2h",
  },
  {
    id: "2",
    author: {
      name: "Carlos Rodríguez",
      avatar: "/man-avatar.png",
      username: "@carlos_dev",
    },
    content:
      "Acabo de terminar mi primer proyecto en React! 🚀 Ha sido un viaje increíble de aprendizaje. ¿Algún consejo para un principiante?",
    likes: 89,
    comments: [
      {
        id: "c1",
        author: "Ana López",
        content: "¡Felicidades! Sigue practicando y no dejes de aprender 💪",
        timestamp: "1h",
      },
    ],
    timestamp: "4h",
  },
  {
    id: "3",
    author: {
      name: "Laura Martínez",
      avatar: "/professional-woman.png",
      username: "@laura_design",
    },
    content: "Nuevo diseño para mi portafolio. ¿Qué opinan? Siempre es bueno recibir feedback de la comunidad 🎨",
    image: "/portfolio-design.jpg",
    likes: 256,
    comments: [
      {
        id: "c2",
        author: "Pedro Sánchez",
        content: "Me encanta la paleta de colores! Muy profesional",
        timestamp: "30min",
      },
      {
        id: "c3",
        author: "Sofia Torres",
        content: "El layout es perfecto, buen trabajo! 👏",
        timestamp: "15min",
      },
    ],
    timestamp: "6h",
  },
]

export default function SocialMediaApp() {
  const [activeTab, setActiveTab] = useState<"inicio" | "perfil" | "crear">("inicio")
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    setCurrentUser(user)
  }, [])

  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked,
          }
        }
        return post
      }),
    )
  }

  const handleComment = (postId: string, comment: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `c${Date.now()}`,
                author: currentUser?.username || "Usuario Actual",
                content: comment,
                timestamp: "ahora",
              },
            ],
          }
        }
        return post
      }),
    )
  }

  const handleLogout = () => {
    AuthService.logout()
    setCurrentUser(null)
    setActiveTab("inicio")
  }

  const handleAuthSuccess = () => {
    const user = AuthService.getCurrentUser()
    setCurrentUser(user)
  }

  const handleCreateTabClick = () => {
    if (!currentUser) {
      setShowAuthModal(true)
    } else {
      setActiveTab("crear")
    }
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
  }

  const handleEditPost = (postId: string, newContent: string, newImage?: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            content: newContent,
            image: newImage || post.image,
          }
        }
        return post
      }),
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
        onCreateClick={handleCreateTabClick}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {activeTab === "inicio" && (
          <Feed
            posts={posts}
            onLike={handleLike}
            onComment={handleComment}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            currentUser={currentUser}
          />
        )}
        {activeTab === "perfil" && <Profile currentUser={currentUser} />}
        {activeTab === "crear" && currentUser && (
          <CreatePost
            currentUser={currentUser}
            onPostCreated={(post) => {
              handleAddPost(post)
              setActiveTab("inicio")
            }}
          />
        )}
      </main>

      <Footer />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </div>
  )
}
