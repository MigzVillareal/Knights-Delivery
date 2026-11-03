// Customer / Student Requests API Service

import { apiRequest } from './client.js';

const STATUS_STAGE_MAP = {
  finding: 0,
  accepted: 1,
  picked: 1,
  on_way: 2,
  arriving: 2,
  delivered: 3,
  cancelled: 0,
};

/**
 * Normalizes backend request record into the format expected by the frontend UI
 */
export function normalizeRequest(raw) {
  if (!raw) return null;

  const status = raw.status || 'finding';
  const fee = raw.customer_estimate_minor
    ? Math.round(raw.customer_estimate_minor / 100)
    : (raw.fee || 25);

  let formattedTime = 'Just now';
  if (raw.created_at) {
    try {
      const d = new Date(raw.created_at);
      formattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      formattedTime = 'Recent';
    }
  }

  return {
    id: raw.id,
    cat: raw.category || 'food',
    items: raw.item_details || raw.itemDetails || 'Delivery items',
    pickup: typeof raw.pickup === 'object'
      ? raw.pickup?.address
      : (raw.pickup_address || raw.pickup || "Campus Canteen"),
    pickupInstructions: typeof raw.pickup === 'object' ? raw.pickup?.instructions : raw.pickup_instructions,
    dropoff: typeof raw.dropoff === 'object'
      ? raw.dropoff?.address
      : (raw.dropoff_address || raw.dropoff || "Campus Dropoff"),
    dropoffInstructions: typeof raw.dropoff === 'object' ? raw.dropoff?.instructions : raw.dropoff_instructions,
    status,
    stage: STATUS_STAGE_MAP[status] ?? 0,
    fee,
    tip: raw.tip || 0,
    time: raw.time || formattedTime,
    notes: raw.handoff_note || raw.handoffNote || '',
    runnerId: raw.assigned_runner_id || null,
    raw,
  };
}

/**
 * Fetch caller's list of requests
 */
export async function fetchRequests({ limit = 20, cursor } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (cursor) query.set('cursor', String(cursor));

  const endpoint = `/requests${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await apiRequest(endpoint, { method: 'GET' });
  const list = Array.isArray(response) ? response : (response?.data || []);
  return list.map(normalizeRequest);
}

/**
 * Fetch a single request by ID
 */
export async function fetchRequestById(requestId) {
  const response = await apiRequest(`/requests/${requestId}`, { method: 'GET' });
  const raw = response?.data || response;
  return normalizeRequest(raw);
}

/**
 * Create a new delivery request
 * Shapes payload to match backend request.validator.js
 */
export async function createRequest({
  category,
  itemDetails,
  pickupAddress,
  pickupInstructions = null,
  dropoffAddress,
  dropoffInstructions = null,
  handoffNote = null,
  customerEstimate = null,
}) {
  const payload = {
    category: category.toLowerCase().trim(),
    itemDetails: itemDetails.trim(),
    pickup: {
      address: pickupAddress.trim(),
      instructions: pickupInstructions ? pickupInstructions.trim() : null,
    },
    dropoff: {
      address: dropoffAddress.trim(),
      instructions: dropoffInstructions ? dropoffInstructions.trim() : null,
    },
    handoffNote: handoffNote ? handoffNote.trim() : null,
  };

  if (customerEstimate) {
    payload.customerEstimate = customerEstimate;
  }

  const response = await apiRequest('/requests', {
    method: 'POST',
    body: payload,
  });

  const created = response?.data || response;
  return normalizeRequest(created);
}

/**
 * Fetch delivery event tracking history for an order
 */
export async function fetchRequestEvents(requestId) {
  const response = await apiRequest(`/requests/${requestId}/events`, { method: 'GET' });
  return response?.data || response || [];
}

/**
 * Report an issue with an active or delivered request
 */
export async function reportRequestIssue(requestId, { reason, description }) {
  const response = await apiRequest(`/requests/${requestId}/issues`, {
    method: 'POST',
    body: { reason, description },
  });
  return response?.data || response;
}

