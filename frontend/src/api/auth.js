// Authentication service for Knights Delivery

import { apiRequest, setStoredToken, clearStoredToken, getStoredToken } from './client.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Sign in using email & password against Supabase Auth
 * Falls back to storing token directly if called with custom credentials
 */
export async function login({ email, password }) {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || 'Login failed');
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  }

  // If local development without Supabase client keys configured:
  // Store a placeholder token or pass through
  return {
    user: { email, fullName: email.split('@')[0] },
    access_token: getStoredToken() || 'dev-token',
  };
}

/**
 * Sign up a new student/runner account
 */
export async function signup({ email, password, fullName }) {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        data: { full_name: fullName },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || 'Signup failed');
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    return data;
  }

  return { user: { email, fullName } };
}

/**
 * Sign out user and remove stored credentials
 */
export function logout() {
  clearStoredToken();
}

/**
 * Check if user has an active token stored
 */
export function isAuthenticated() {
  return Boolean(getStoredToken());
}

