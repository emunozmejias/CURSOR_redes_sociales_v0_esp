"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Feed } from "@/components/feed"
import { Profile } from "@/components/profile"
import { CreatePost } from "@/components/create-post"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function SocialMediaApp() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"inicio" | "perfil" | "crear">("inicio")
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogout = async () => {
    await logout()
    setActiveTab("inicio")
  }

  const handleCreateTabClick = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setActiveTab("crear")
    }
  }

  const handlePostCreated = () => {
    // Navegar al feed después de crear un post
    setActiveTab("inicio")
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
        onCreateClick={handleCreateTabClick}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {activeTab === "inicio" && <Feed currentUser={user} />}
        {activeTab === "perfil" && <Profile />}
        {activeTab === "crear" && user && (
          <CreatePost currentUser={user} onPostCreated={handlePostCreated} />
        )}
      </main>

      <Footer />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}
