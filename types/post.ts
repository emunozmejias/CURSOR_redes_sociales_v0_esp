export interface Post {
  id: string
  author: {
    name: string
    avatar: string
    username: string
  }
  content: string
  image?: string
  likes: number
  liked?: boolean
  comments: Comment[]
  timestamp: string
}

export interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
}
