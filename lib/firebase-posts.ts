"use client"

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Post, Comment } from "@/types/post"

// Colecciones de Firestore
const POSTS_COLLECTION = "posts"
const COMMENTS_COLLECTION = "comments"

/**
 * Crea una nueva publicación
 */
export async function createPost(
  userId: string,
  authorName: string,
  authorUsername: string,
  authorAvatar: string,
  content: string,
  image?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const postData = {
      authorId: userId,
      author: {
        name: authorName,
        username: `@${authorUsername}`,
        avatar: authorAvatar || "/user-avatar.jpg",
      },
      content,
      image: image || null,
      likes: 0,
      likedBy: [],
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData)

    return { success: true, postId: docRef.id }
  } catch (error) {
    console.error("Error al crear publicación:", error)
    return { success: false, error: "Error al crear la publicación" }
  }
}

/**
 * Obtiene todas las publicaciones ordenadas por fecha
 */
export async function getPosts(): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy("createdAt", "desc")
    )

    const querySnapshot = await getDocs(q)
    const posts: Post[] = []

    for (const docSnap of querySnapshot.docs) {
      const post = await mapDocToPost(docSnap.id, docSnap.data())
      posts.push(post)
    }

    return posts
  } catch (error) {
    console.error("Error al obtener publicaciones:", error)
    return []
  }
}

/**
 * Obtiene las publicaciones de un usuario específico
 */
export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    // Consulta simple sin orderBy para evitar necesitar índice compuesto
    const q = query(
      collection(db, POSTS_COLLECTION),
      where("authorId", "==", userId)
    )

    const querySnapshot = await getDocs(q)
    const posts: Post[] = []

    for (const docSnap of querySnapshot.docs) {
      const post = await mapDocToPost(docSnap.id, docSnap.data())
      posts.push(post)
    }

    // Ordenar en el cliente por fecha de creación (más reciente primero)
    posts.sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0
      const dateB = b.createdAt?.toMillis() || 0
      return dateB - dateA
    })

    return posts
  } catch (error) {
    console.error("Error al obtener publicaciones del usuario:", error)
    return []
  }
}

/**
 * Suscribe a cambios en las publicaciones (tiempo real)
 */
export function subscribeToPostsChanges(
  callback: (posts: Post[]) => void
): () => void {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", "desc")
  )

  return onSnapshot(q, async (querySnapshot) => {
    const posts: Post[] = []

    for (const docSnap of querySnapshot.docs) {
      const post = await mapDocToPost(docSnap.id, docSnap.data())
      posts.push(post)
    }

    callback(posts)
  })
}

/**
 * Da o quita like a una publicación
 */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ success: boolean; liked: boolean; error?: string }> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      return { success: false, liked: false, error: "Publicación no encontrada" }
    }

    const postData = postSnap.data()
    const likedBy: string[] = postData.likedBy || []
    const hasLiked = likedBy.includes(userId)

    if (hasLiked) {
      // Quitar like
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      })
      return { success: true, liked: false }
    } else {
      // Dar like
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      })
      return { success: true, liked: true }
    }
  } catch (error) {
    console.error("Error al dar like:", error)
    return { success: false, liked: false, error: "Error al procesar el like" }
  }
}

/**
 * Agrega un comentario a una publicación
 */
export async function addComment(
  postId: string,
  userId: string,
  authorName: string,
  content: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  try {
    const commentData = {
      postId,
      authorId: userId,
      author: authorName,
      content,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData)

    // Incrementar contador de comentarios en el post
    const postRef = doc(db, POSTS_COLLECTION, postId)
    await updateDoc(postRef, {
      commentCount: increment(1),
    })

    return { success: true, commentId: docRef.id }
  } catch (error) {
    console.error("Error al agregar comentario:", error)
    return { success: false, error: "Error al agregar el comentario" }
  }
}

/**
 * Obtiene los comentarios de una publicación
 */
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    // Consulta simple sin orderBy para evitar necesitar índice compuesto
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("postId", "==", postId)
    )

    const querySnapshot = await getDocs(q)
    const comments: Comment[] = []

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      comments.push({
        id: docSnap.id,
        author: data.author,
        content: data.content,
        timestamp: formatTimestamp(data.createdAt),
        createdAt: data.createdAt?.toMillis() || 0,
      })
    })

    // Ordenar en el cliente por fecha de creación
    comments.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))

    // Eliminar el campo temporal createdAt
    return comments.map(({ createdAt, ...comment }) => comment) as Comment[]
  } catch (error) {
    console.error("Error al obtener comentarios:", error)
    return []
  }
}

/**
 * Actualiza una publicación
 */
export async function updatePost(
  postId: string,
  userId: string,
  updates: { content?: string; image?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      return { success: false, error: "Publicación no encontrada" }
    }

    // Verificar que el usuario sea el autor
    if (postSnap.data().authorId !== userId) {
      return { success: false, error: "No tienes permiso para editar esta publicación" }
    }

    // Construir objeto de actualización sin valores undefined
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    }

    if (updates.content !== undefined) {
      updateData.content = updates.content
    }

    if (updates.image !== undefined) {
      // Si image es string vacío, guardarlo como null
      updateData.image = updates.image || null
    }

    await updateDoc(postRef, updateData)

    return { success: true }
  } catch (error) {
    console.error("Error al actualizar publicación:", error)
    return { success: false, error: "Error al actualizar la publicación" }
  }
}

/**
 * Elimina una publicación
 */
export async function deletePost(
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId)
    const postSnap = await getDoc(postRef)

    if (!postSnap.exists()) {
      return { success: false, error: "Publicación no encontrada" }
    }

    // Verificar que el usuario sea el autor
    if (postSnap.data().authorId !== userId) {
      return { success: false, error: "No tienes permiso para eliminar esta publicación" }
    }

    // Eliminar comentarios asociados
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("postId", "==", postId)
    )
    const commentsSnapshot = await getDocs(commentsQuery)
    
    const deletePromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Eliminar la publicación
    await deleteDoc(postRef)

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar publicación:", error)
    return { success: false, error: "Error al eliminar la publicación" }
  }
}

/**
 * Mapea un documento de Firestore a tipo Post
 */
async function mapDocToPost(id: string, data: DocumentData): Promise<Post> {
  // Obtener comentarios
  const comments = await getComments(id)

  return {
    id,
    authorId: data.authorId,
    author: {
      name: data.author.name,
      avatar: data.author.avatar,
      username: data.author.username,
    },
    content: data.content,
    image: data.image || undefined,
    likes: data.likes || 0,
    liked: false, // Se establecerá según el usuario actual
    likedBy: data.likedBy || [],
    comments,
    timestamp: formatTimestamp(data.createdAt),
    createdAt: data.createdAt,
  }
}

/**
 * Formatea un timestamp de Firestore a texto legible
 */
function formatTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp) return "ahora"

  const date = timestamp.toDate()
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "ahora"
  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })
}

