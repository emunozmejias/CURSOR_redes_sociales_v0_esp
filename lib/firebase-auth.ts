"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

// Tipo de usuario de la aplicación
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  photoURL: string | null
  bio: string
  location: string
  website: string
  createdAt: string
}

// Tipo para el perfil almacenado en Firestore
export interface UserProfile {
  username: string
  displayName: string
  bio: string
  location: string
  website: string
  photoURL: string | null
  createdAt: string
}

/**
 * Registra un nuevo usuario con email y contraseña
 */
export async function registerUser(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Actualizar perfil con el nombre de usuario
    await updateProfile(firebaseUser, {
      displayName: username,
    })

    // Crear perfil en Firestore
    const userProfile: UserProfile = {
      username,
      displayName: username,
      bio: "¡Hola! Soy nuevo en SocialApp 👋",
      location: "",
      website: "",
      photoURL: null,
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "users", firebaseUser.uid), userProfile)

    const user = mapFirebaseUserToUser(firebaseUser, userProfile)

    return { success: true, user }
  } catch (error: unknown) {
    const errorMessage = getAuthErrorMessage(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Inicia sesión con email y contraseña
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Obtener perfil de Firestore
    const userProfile = await getUserProfile(firebaseUser.uid)

    const user = mapFirebaseUserToUser(firebaseUser, userProfile)

    return { success: true, user }
  } catch (error: unknown) {
    const errorMessage = getAuthErrorMessage(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Cierra la sesión del usuario actual
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth)
}

/**
 * Obtiene el perfil del usuario desde Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    }

    return null
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return null
  }
}

/**
 * Actualiza el perfil del usuario en Firestore
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "users", userId)
    await setDoc(docRef, updates, { merge: true })
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return { success: false, error: "Error al actualizar el perfil" }
  }
}

/**
 * Suscribe a cambios en el estado de autenticación
 */
export function subscribeToAuthChanges(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userProfile = await getUserProfile(firebaseUser.uid)
      const user = mapFirebaseUserToUser(firebaseUser, userProfile)
      callback(user)
    } else {
      callback(null)
    }
  })
}

/**
 * Obtiene el usuario actual de Firebase Auth
 */
export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser
}

/**
 * Mapea un usuario de Firebase a nuestro tipo User
 */
function mapFirebaseUserToUser(
  firebaseUser: FirebaseUser,
  profile: UserProfile | null
): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    username: profile?.username || firebaseUser.displayName || "usuario",
    displayName: profile?.displayName || firebaseUser.displayName || "Usuario",
    photoURL: profile?.photoURL || firebaseUser.photoURL,
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || "",
    createdAt: profile?.createdAt || new Date().toISOString(),
  }
}

/**
 * Traduce los errores de Firebase Auth a español
 */
function getAuthErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: string; message?: string }
  
  console.error("Firebase Auth Error:", firebaseError.code, firebaseError.message)
  
  switch (firebaseError.code) {
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado"
    case "auth/invalid-email":
      return "El correo electrónico no es válido"
    case "auth/operation-not-allowed":
      return "El método de autenticación no está habilitado. Habilita Email/Password en Firebase Console."
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres"
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada"
    case "auth/user-not-found":
      return "No existe una cuenta con este correo electrónico"
    case "auth/wrong-password":
      return "Contraseña incorrecta"
    case "auth/invalid-credential":
      return "Credenciales inválidas. Verifica tu correo y contraseña"
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta de nuevo más tarde"
    case "auth/network-request-failed":
      return "Error de conexión. Verifica tu conexión a internet."
    case "auth/invalid-api-key":
      return "La API Key de Firebase no es válida. Verifica tu configuración."
    case "auth/api-key-not-valid":
      return "La API Key de Firebase no es válida. Verifica tu configuración."
    case "auth/configuration-not-found":
      return "Configuración de Firebase no encontrada. Habilita Authentication en Firebase Console."
    default:
      // Si es un error 400, probablemente Authentication no está habilitado
      if (firebaseError.message?.includes("400") || firebaseError.message?.includes("CONFIGURATION_NOT_FOUND")) {
        return "Firebase Authentication no está configurado. Habilita Email/Password en Firebase Console > Authentication > Sign-in method"
      }
      return `Error de autenticación: ${firebaseError.code || "desconocido"}`
  }
}

