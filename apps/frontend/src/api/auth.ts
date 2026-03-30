/**
 * API d'authentification et profil utilisateur.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string) || ''

export interface User {
  id: number
  email: string
  name: string
  avatarUrl: string | null
  bio: string | null
  isOnline?: boolean
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Récupère l'utilisateur connecté via le token.
 */
export async function getMe(token: string): Promise<User | null> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(token),
  })
  const json: ApiResponse<User> = await res.json()
  if (!res.ok || !json.success || !json.data) return null
  return json.data
}

/**
 * Met à jour le profil de l'utilisateur connecté.
 */
export async function updateMe(
  token: string,
  data: { name?: string; bio?: string | null; avatarUrl?: string | null }
): Promise<User | null> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  })
  const json: ApiResponse<User> = await res.json()
  if (!res.ok || !json.success || !json.data) return null
  return json.data
}

/** Réponse login/register */
export interface AuthResponse {
  token: string
  user: User
}

/**
 * Inscription (email + mot de passe).
 */
export async function register(data: {
  email: string
  name: string
  password: string
}): Promise<{ token: string; user: User } | { error: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  const json: ApiResponse<AuthResponse> = await res.json()
  if (!res.ok) {
    return { error: (json as { message?: string }).message || 'Erreur lors de l\'inscription' }
  }
  if (!json.success || !json.data) return { error: 'Réponse invalide' }
  return { token: json.data.token, user: json.data.user }
}

/**
 * Connexion (email + mot de passe).
 */
export async function login(data: {
  email: string
  password: string
}): Promise<{ token: string; user: User } | { error: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  const json: ApiResponse<AuthResponse> = await res.json()
  if (!res.ok) {
    return { error: (json as { message?: string }).message || 'Email ou mot de passe incorrect' }
  }
  if (!json.success || !json.data) return { error: 'Réponse invalide' }
  return { token: json.data.token, user: json.data.user }
}
