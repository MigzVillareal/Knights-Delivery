// User Profile API Service

import { apiRequest } from './client.js';

/**
 * Fetch current authenticated user's profile
 */
export async function getProfile() {
  const response = await apiRequest('/profile', { method: 'GET' });
  return response?.data || response;
}

/**
 * Update current user's profile
 * @param {object} updates - { displayName, phone }
 */
export async function updateProfile({ displayName, phone }) {
  const response = await apiRequest('/profile', {
    method: 'PATCH',
    body: { displayName, phone },
  });
  return response?.data || response;
}

