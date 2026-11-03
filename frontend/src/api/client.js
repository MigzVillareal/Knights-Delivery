// Base API Client for Knights Delivery Frontend

const TOKEN_KEY = 'knights_delivery_token';

// Determine the base API URL:
// 1. Vite environment variable: VITE_API_BASE_URL (set in Vercel or .env)
// 2. Local fallback: http://localhost:5000/api/v1
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // LocalStorage unavailable
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // LocalStorage unavailable
  }
}

/**
 * Core HTTP Request Wrapper
 * @param {string} endpoint - Path such as '/requests' or '/profile'
 * @param {object} options - Fetch options including method, body, headers, customToken
 */
export async function apiRequest(endpoint, {
  method = 'GET',
  body,
  token = getStoredToken(),
  headers = {},
} = {}) {
  const url = `${API_BASE.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // On hosted deployments (e.g., Vercel), if no VITE_API_BASE_URL is configured,
  // skip attempting to reach localhost:5000 and gracefully signal offline mode.
  const isHostedWithoutBackend =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !import.meta.env.VITE_API_BASE_URL;

  if (isHostedWithoutBackend) {
    const error = new Error('Remote backend URL not configured yet. Running in offline/demo mode.');
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...headers,
  };

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined && body !== null) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (netError) {
    const error = new Error(`Cannot connect to server at ${API_BASE}. Make sure the backend is running.`);
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message = data?.message || (typeof data === 'string' && data) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = data?.code;
    error.details = data?.details;
    error.raw = data;
    throw error;
  }

  return data;
}

