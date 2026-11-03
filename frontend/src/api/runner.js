// Courier / Runner API Service

import { apiRequest } from './client.js';
import { normalizeRequest } from './requests.js';

/**
 * Fetch runner application status
 */
export async function getRunnerApplication() {
  const response = await apiRequest('/runner/application', { method: 'GET' });
  return response?.data || response;
}

/**
 * Submit an application to become a courier
 */
export async function submitRunnerApplication() {
  const response = await apiRequest('/runner/application', {
    method: 'POST',
    body: {},
  });
  return response?.data || response;
}

/**
 * Fetch open available delivery requests for couriers
 */
export async function fetchOpenQueue({ limit = 20, cursor } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (cursor) query.set('cursor', String(cursor));

  const endpoint = `/runner/requests${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiRequest(endpoint, { method: 'GET' });
  const list = Array.isArray(response) ? response : (response?.data || []);
  return list.map(normalizeRequest);
}

/**
 * Fetch currently assigned delivery requests for the courier
 */
export async function fetchAssignedQueue({ limit = 20, cursor } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (cursor) query.set('cursor', String(cursor));

  const endpoint = `/runner/requests/assigned${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiRequest(endpoint, { method: 'GET' });
  const list = Array.isArray(response) ? response : (response?.data || []);
  return list.map(normalizeRequest);
}

/**
 * Courier accepts an open request
 */
export async function acceptRequest(requestId) {
  const response = await apiRequest(`/requests/${requestId}/accept`, {
    method: 'POST',
    body: {},
  });
  return normalizeRequest(response?.data || response);
}

/**
 * Advance delivery stage: 'start' (heading to dropoff) or 'mark_delivered'
 */
export async function updateLifecycle(requestId, action) {
  if (!['start', 'mark_delivered'].includes(action)) {
    throw new Error(`Invalid lifecycle action "${action}". Must be "start" or "mark_delivered".`);
  }

  const response = await apiRequest(`/requests/${requestId}/lifecycle`, {
    method: 'POST',
    body: { action },
  });
  return normalizeRequest(response?.data || response);
}

