"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  subscribeToAuthChanges,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  type User,
  type UserProfile,
} from "./firebase-auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Suscribirse a cambios en el estado de autenticación
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return { success: result.success, error: result.error }
  }

  const register = async (email: string, password: string, username: string) => {
    const result = await registerUser(email, password, username)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return { success: result.success, error: result.error }
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: "No hay usuario autenticado" }
    }

    const result = await updateUserProfile(user.id, updates)
    
    if (result.success) {
      // Actualizar el usuario local con los cambios
      setUser({
        ...user,
        ...updates,
      })
    }

    return result
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  
  return context
}

