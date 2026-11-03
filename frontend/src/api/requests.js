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
  if (!raw || typeof raw !== 'object') return null;

  const status = raw.status || 'finding';

  let rawFee = 25;
  if (raw.quote?.amountMinor) {
    rawFee = Math.round(raw.quote.amountMinor / 100);
  } else if (raw.customer_estimate_minor) {
    rawFee = Math.round(raw.customer_estimate_minor / 100);
  } else if (raw.fee) {
    rawFee = raw.fee;
  }
  const fee = Number(rawFee) || 25;
  const tip = Number(raw.tip) || 0;

  let formattedTime = 'Just now';
  const createdDate = raw.createdAt || raw.created_at;
  if (createdDate) {
    try {
      const d = new Date(createdDate);
      formattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      formattedTime = 'Recent';
    }
  }

  const items = raw.itemSummary || raw.item_summary || raw.item_details || raw.itemDetails || 'Delivery items';
  const title = raw.title || items;

  let pickup = 'Campus Pickup';
  if (typeof raw.pickup === 'object' && raw.pickup?.address) {
    pickup = raw.pickup.address;
  } else if (raw.pickupArea || raw.pickup_area) {
    pickup = raw.pickupArea || raw.pickup_area;
  } else if (raw.pickup_address || raw.pickup) {
    pickup = raw.pickup_address || raw.pickup;
  }

  let dropoff = 'Campus Dropoff';
  if (typeof raw.dropoff === 'object' && raw.dropoff?.address) {
    dropoff = raw.dropoff.address;
  } else if (raw.dropoffArea || raw.dropoff_area) {
    dropoff = raw.dropoffArea || raw.dropoff_area;
  } else if (raw.dropoff_address || raw.dropoff) {
    dropoff = raw.dropoff_address || raw.dropoff;
  }

  return {
    id: raw.id || `REQ-${Date.now()}`,
    title,
    cat: raw.category || 'food',
    items,
    pickup,
    pickupInstructions: typeof raw.pickup === 'object' ? (raw.pickup?.instructions || '') : (raw.pickup_instructions || ''),
    dropoff,
    dropoffInstructions: typeof raw.dropoff === 'object' ? (raw.dropoff?.instructions || '') : (raw.dropoff_instructions || ''),
    status,
    stage: STATUS_STAGE_MAP[status] ?? 0,
    fee,
    tip,
    time: raw.time || formattedTime,
    notes: raw.handoff_note || raw.handoffNote || '',
    runnerId: raw.assigned_runner_id || null,
    student: raw.customer_name || raw.customer?.name || raw.student || 'Student',
    phone: raw.customer_phone || raw.customer?.phone || raw.phone || '',
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
  return list.map(normalizeRequest).filter(Boolean);
}

/**
 * Fetch single request details by ID
 */
export async function fetchRequestById(requestId) {
  const response = await apiRequest(`/requests/${requestId}`, { method: 'GET' });
  return normalizeRequest(response?.data || response);
}

/**
 * Create a new delivery request
 */
export async function createRequest({
  category = 'food',
  itemDetails,
  pickupAddress,
  pickupInstructions = null,
  dropoffAddress,
  dropoffInstructions = null,
  handoffNote = null,
  customerEstimate = { amountMinor: 2500, currency: 'PHP' },
}) {
  const payload = {
    category: String(category || 'food').toLowerCase().trim(),
    itemDetails: String(itemDetails || '').trim(),
    pickup: {
      address: String(pickupAddress || 'Campus Pickup').trim(),
      instructions: pickupInstructions ? String(pickupInstructions).trim() : null,
    },
    dropoff: {
      address: String(dropoffAddress || 'Campus Dropoff').trim(),
      instructions: dropoffInstructions ? String(dropoffInstructions).trim() : null,
    },
    handoffNote: handoffNote ? String(handoffNote).trim() : null,
    customerEstimate: {
      amountMinor: Math.round(Number(customerEstimate?.amountMinor) || 2500),
      currency: customerEstimate?.currency || 'PHP',
    },
  };

  const response = await apiRequest('/requests', {
    method: 'POST',
    body: payload,
  });

  return normalizeRequest(response?.data || response);
}

/**
 * Fetch request lifecycle events/timeline
 */
export async function fetchRequestEvents(requestId) {
  const response = await apiRequest(`/requests/${requestId}/events`, { method: 'GET' });
  return Array.isArray(response) ? response : (response?.data || []);
}

/**
 * Report an issue on an order
 */
export async function reportRequestIssue(requestId, { reason, description }) {
  const response = await apiRequest(`/requests/${requestId}/issues`, {
    method: 'POST',
    body: { reason, description },
  });
  return normalizeRequest(response?.data || response);
}
