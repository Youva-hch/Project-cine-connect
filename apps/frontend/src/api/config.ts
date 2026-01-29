// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
}

// Fonction utilitaire pour les requêtes API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${apiConfig.baseURL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({ message: 'Erreur inconnue' }))

  if (!response.ok) {
    // Le backend retourne { success: false, message: ... } en cas d'erreur
    const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`
    throw new Error(errorMessage)
  }

  // Vérifier si la réponse a le format { success, data } du backend
  if (data.success === false) {
    throw new Error(data.message || 'Erreur inconnue')
  }

  return data
}

export default apiRequest





