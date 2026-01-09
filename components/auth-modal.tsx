"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      let result

      if (mode === "login") {
        result = await login(email, password)
      } else {
        // Validar username para registro
        if (!username.trim()) {
          setError("El nombre de usuario es requerido")
          setIsLoading(false)
          return
        }
        result = await register(email, password, username)
      }

      if (result.success) {
        setEmail("")
        setUsername("")
        setPassword("")
        onAuthSuccess?.()
        onClose()
      } else {
        setError(result.error || "Error desconocido")
      }
    } catch (err) {
      setError("Ha ocurrido un error. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError("")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError("")
      setEmail("")
      setUsername("")
      setPassword("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}</DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Ingresa tus credenciales para acceder a tu cuenta" 
              : "Crea una cuenta para comenzar a compartir"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={mode === "register"}
                minLength={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {mode === "register" && (
              <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Procesando..." : mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            </span>{" "}
            <Button type="button" variant="link" onClick={toggleMode} className="p-0 h-auto">
              {mode === "login" ? "Regístrate" : "Inicia sesión"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
