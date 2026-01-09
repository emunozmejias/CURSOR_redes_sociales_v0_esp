"use client"

import { Home, User, PlusSquare, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User as UserType } from "@/lib/firebase-auth"

interface HeaderProps {
  activeTab: "inicio" | "perfil" | "crear"
  setActiveTab: (tab: "inicio" | "perfil" | "crear") => void
  currentUser: UserType | null
  onLogout: () => void
  onLoginClick: () => void
  onCreateClick: () => void
}

export function Header({ activeTab, setActiveTab, currentUser, onLogout, onLoginClick, onCreateClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-4xl">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-teal" />
          <h1 className="text-xl font-bold text-foreground">SocialApp</h1>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={activeTab === "inicio" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("inicio")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Button>

          <Button
            variant={activeTab === "perfil" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("perfil")}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </Button>

          <Button
            variant={activeTab === "crear" ? "default" : "ghost"}
            size="sm"
            onClick={onCreateClick}
            className="gap-2"
          >
            <PlusSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Crear</span>
          </Button>

          {currentUser ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.photoURL || "/user-avatar.jpg"} alt={currentUser.username} />
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm text-foreground">{currentUser.username}</span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={onLoginClick} className="gap-2 ml-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
