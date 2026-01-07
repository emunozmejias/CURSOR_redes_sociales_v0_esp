"use client"

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

interface StoredUser extends User {
  passwordHash: string
}

// Función simple de hash (en producción usar bcrypt en el backend)
async function simpleHash(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export class AuthService {
  private static USERS_KEY = "social_app_users"
  private static CURRENT_USER_KEY = "social_app_current_user"

  static async register(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = this.getUsers()

      // Verificar si el email ya existe
      if (users.find((u) => u.email === email)) {
        return { success: false, error: "El email ya está registrado" }
      }

      const passwordHash = await simpleHash(password)
      const username = email.split("@")[0]

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        email,
        username,
        passwordHash,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

      const publicUser: User = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt,
      }

      this.setCurrentUser(publicUser)
      return { success: true, user: publicUser }
    } catch (error) {
      return { success: false, error: "Error al registrar usuario" }
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = this.getUsers()
      const passwordHash = await simpleHash(password)

      const user = users.find((u) => u.email === email && u.passwordHash === passwordHash)

      if (!user) {
        return { success: false, error: "Email o contraseña incorrectos" }
      }

      const publicUser: User = {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      }

      this.setCurrentUser(publicUser)
      return { success: true, user: publicUser }
    } catch (error) {
      return { success: false, error: "Error al iniciar sesión" }
    }
  }

  static logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const userJson = localStorage.getItem(this.CURRENT_USER_KEY)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch {
      return null
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  private static getUsers(): StoredUser[] {
    if (typeof window === "undefined") return []

    const usersJson = localStorage.getItem(this.USERS_KEY)
    if (!usersJson) return []

    try {
      return JSON.parse(usersJson)
    } catch {
      return []
    }
  }

  private static setCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
  }
}
