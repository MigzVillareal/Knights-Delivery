// Base API Client for Knights Delivery Frontend

const TOKEN_KEY = 'knights_delivery_token';

// Backend is deployed separately from the frontend.
// Frontend: https://knights-delivery-d2zq.vercel.app
// Backend:  https://knights-delivery-2dqq.vercel.app
// Override with VITE_API_BASE_URL env var if the backend URL ever changes.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://knights-delivery-2dqq.vercel.app/api/v1';

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

