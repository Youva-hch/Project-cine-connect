import { clearUserCookie } from '@/lib/userCookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const ACCESS_TOKEN_KEY = 'token';

let refreshPromise: Promise<string | null> | null = null;

export const apiConfig = {
  baseURL: API_BASE_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3000'),
};

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, _refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('refreshToken');
}

async function performTokenRefresh(): Promise<string | null> {
  try {
    const refreshUrl = apiConfig.baseURL
      ? `${apiConfig.baseURL}/api/auth/refresh`
      : '/api/auth/refresh';

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json().catch(() => null) as {
      success?: boolean;
      data?: { token?: string };
    } | null;

    const nextToken = data?.data?.token;

    if (!response.ok || !data?.success || !nextToken) {
      clearAuthTokens();
      clearUserCookie();
      return null;
    }

    setAuthTokens(nextToken);
    return nextToken;
  } catch {
    clearAuthTokens();
    clearUserCookie();
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = apiConfig.baseURL ? `${apiConfig.baseURL}${endpoint}` : endpoint;
  const requestHeaders = (options.headers as Record<string, string> | undefined) ?? {};
  const hasExplicitAuthorization = Object.keys(requestHeaders).some(
    (key) => key.toLowerCase() === 'authorization'
  );

  const createHeaders = (token: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(token && !hasExplicitAuthorization ? { Authorization: `Bearer ${token}` } : {}),
    ...requestHeaders,
  });

  let response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: createHeaders(getAccessToken()),
  });

  const shouldTryRefresh =
    response.status === 401 &&
    !endpoint.includes('/api/auth/refresh') &&
    !endpoint.includes('/api/auth/login') &&
    !endpoint.includes('/api/auth/register');

  if (shouldTryRefresh) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: createHeaders(newAccessToken),
      });
    }
  }

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
