// Types partagés entre l'API et l'application
// Ces types correspondent aux types générés par Drizzle ORM

export interface User {
  id: number
  email: string
  name: string
  passwordHash?: string
  avatarUrl: string | null
  bio: string | null
  isOnline: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Film {
  id: number
  title: string
  description: string | null
  director: string | null
  releaseYear: number | null
  durationMinutes: number | null
  posterUrl: string | null
  ratingAverage: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: number
  name: string
  description: string | null
  slug: string
  createdAt: Date
}

export interface Review {
  id: number
  userId: number
  filmId: number
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Friend {
  id: number
  userId: number
  friendId: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}



