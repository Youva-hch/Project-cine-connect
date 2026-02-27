const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiConfig = {
  baseURL: API_BASE_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3000'),
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = apiConfig.baseURL ? `${apiConfig.baseURL}${endpoint}` : endpoint;
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({ message: 'Erreur inconnue' }));

  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }
  if (data.success === false) {
    throw new Error(data.message || 'Erreur inconnue');
  }
  return data;
}
