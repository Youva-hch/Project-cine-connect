const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

let refreshPromise: Promise<string | null> | null = null;

export const apiConfig = {
  baseURL: API_BASE_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:3000'),
};

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function performTokenRefresh(): Promise<string | null> {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    clearAuthTokens();
    return null;
  }

  try {
    const refreshUrl = apiConfig.baseURL
      ? `${apiConfig.baseURL}/api/auth/refresh`
      : '/api/auth/refresh';

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const data = await response.json().catch(() => null) as {
      success?: boolean;
      data?: { token?: string; refreshToken?: string };
    } | null;

    const nextToken = data?.data?.token;
    const nextRefreshToken = data?.data?.refreshToken;

    if (!response.ok || !data?.success || !nextToken || !nextRefreshToken) {
      clearAuthTokens();
      localStorage.removeItem('user');
      return null;
    }

    setAuthTokens(nextToken, nextRefreshToken);
    return nextToken;
  } catch {
    clearAuthTokens();
    localStorage.removeItem('user');
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

  let response = await fetch(url, { ...options, headers: createHeaders(getAccessToken()) });

  const shouldTryRefresh =
    response.status === 401 &&
    !endpoint.includes('/api/auth/refresh') &&
    !endpoint.includes('/api/auth/login') &&
    !endpoint.includes('/api/auth/register');

  if (shouldTryRefresh) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      response = await fetch(url, { ...options, headers: createHeaders(newAccessToken) });
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
