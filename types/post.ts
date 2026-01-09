import type { Timestamp } from "firebase/firestore"

export interface Post {
  id: string
  authorId?: string
  author: {
    name: string
    avatar: string
    username: string
  }
  content: string
  image?: string
  likes: number
  liked?: boolean
  likedBy?: string[]
  comments: Comment[]
  timestamp: string
  createdAt?: Timestamp
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}
