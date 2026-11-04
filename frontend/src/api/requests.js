// Customer / Student Requests API Service

import { apiRequest } from './client.js';
import { formatOrderId } from '../data.js';
export { formatOrderId };

const STATUS_STAGE_MAP = {
  finding: 0,
  accepted: 1,
  picked: 1,
  in_progress: 2,
  on_way: 2,
  arriving: 2,
  delivered: 3,
  completed: 3,
  cancelled: 0,
};

const ORDER_CACHE_KEY = 'knights_order_details_cache';

export function getCachedOrder(id) {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(ORDER_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    return cache[id] || null;
  } catch {
    return null;
  }
}

export function cacheOrderDetails(id, details) {
  if (!id || !details) return;
  try {
    const raw = localStorage.getItem(ORDER_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[id] = { ...(cache[id] || {}), ...details };
    localStorage.setItem(ORDER_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore local storage errors
  }
}

const DEFAULT_PICKUPS = {
  food: "Bam-Bam's Canteen",
  supplies: 'ADNU Bookstore',
  printing: 'Print Hub, Phelan',
  errands: 'Xavier Hall',
};

const DEFAULT_DROPOFFS = {
  food: 'Phelan P217 Lab',
  supplies: 'Library Commons',
  printing: 'DCS Faculty Room',
  errands: 'Burns Hall Study Area',
};

/**
 * Normalizes backend request record into the format expected by the frontend UI
 */
export function normalizeRequest(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // The API uses `open` for posted requests; the UI calls that state `finding`.
  const status = raw.status === 'open' ? 'finding' : (raw.status || 'finding');

  let rawFee = null;
  if (raw.quote?.amountMinor !== undefined && raw.quote?.amountMinor !== null) {
    rawFee = Math.round(raw.quote.amountMinor / 100);
  } else if (raw.customer_estimate_minor !== undefined && raw.customer_estimate_minor !== null) {
    rawFee = Math.round(raw.customer_estimate_minor / 100);
  } else if (raw.fee !== undefined && raw.fee !== null) {
    rawFee = raw.fee;
  }
  const fee = rawFee === null ? null : Number(rawFee);
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

  const cat = (raw.category || raw.cat || 'food').toLowerCase();
  const defaultPickup = DEFAULT_PICKUPS[cat] || "Bam-Bam's Canteen";
  const defaultDropoff = DEFAULT_DROPOFFS[cat] || 'Phelan P217 Lab';

  const cached = raw.id ? getCachedOrder(raw.id) : null;

  let items = raw.item_details || raw.itemDetails || null;
  if (!items && cached?.items) {
    items = cached.items;
  }
  if (!items) {
    const rawSummary = raw.itemSummary || raw.item_summary;
    if (rawSummary && !rawSummary.startsWith('Request in ')) {
      items = rawSummary;
    } else {
      const catCapitalized = cat ? (cat.charAt(0).toUpperCase() + cat.slice(1)) : 'Food';
      items = `${catCapitalized} Delivery Order`;
    }
  }
  const title = (raw.title && !raw.title.startsWith('Request in '))
    ? raw.title
    : (cached?.title && !cached.title.startsWith('Request in ') ? cached.title : items);

  let pickup = null;
  if (typeof raw.pickup === 'object' && raw.pickup?.address) {
    pickup = raw.pickup.address;
  } else if (typeof raw.pickup === 'string' && raw.pickup.trim() && raw.pickup !== 'Campus Pickup') {
    pickup = raw.pickup.trim();
  } else if (raw.pickupAddress && raw.pickupAddress !== 'Campus Pickup') {
    pickup = raw.pickupAddress;
  } else if (raw.pickup_address && raw.pickup_address !== 'Campus Pickup') {
    pickup = raw.pickup_address;
  } else if (raw.pickupArea && raw.pickupArea !== 'Campus Pickup') {
    pickup = raw.pickupArea;
  } else if (raw.pickup_area && raw.pickup_area !== 'Campus Pickup') {
    pickup = raw.pickup_area;
  }

  if ((!pickup || pickup === 'Campus Pickup') && cached?.pickup) {
    pickup = cached.pickup;
  }
  if (!pickup || pickup === 'Campus Pickup') {
    pickup = defaultPickup;
  }

  let dropoff = null;
  if (typeof raw.dropoff === 'object' && raw.dropoff?.address) {
    dropoff = raw.dropoff.address;
  } else if (typeof raw.dropoff === 'string' && raw.dropoff.trim() && !raw.dropoff.startsWith('Campus Drop')) {
    dropoff = raw.dropoff.trim();
  } else if (raw.dropoffAddress && !raw.dropoffAddress.startsWith('Campus Drop')) {
    dropoff = raw.dropoffAddress;
  } else if (raw.dropoff_address && !raw.dropoff_address.startsWith('Campus Drop')) {
    dropoff = raw.dropoff_address;
  } else if (raw.dropoffArea && !raw.dropoffArea.startsWith('Campus Drop')) {
    dropoff = raw.dropoffArea;
  } else if (raw.dropoff_area && !raw.dropoff_area.startsWith('Campus Drop')) {
    dropoff = raw.dropoff_area;
  }

  if ((!dropoff || dropoff.startsWith('Campus Drop')) && cached?.dropoff) {
    dropoff = cached.dropoff;
  }
  if (!dropoff || dropoff.startsWith('Campus Drop')) {
    dropoff = defaultDropoff;
  }

  const customerId = raw.customer_id || raw.customerId || cached?.customerId || null;

  const courierName = raw.courier_name
    || raw.courierName
    || raw.runner_name
    || raw.runnerName
    || raw.runner?.display_name
    || raw.runner?.name
    || null;

  const id = raw.id || `REQ-${Date.now()}`;

  return {
    id,
    shortId: formatOrderId(id),
    title,
    cat,
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
    courierName,
    customerId,
    student: raw.customer_name
      || raw.customer?.name
      || raw.customer?.display_name
      || (raw.student && raw.student !== 'Student' ? raw.student : null)
      || cached?.customerName
      || 'Student',
    phone: raw.customer_phone
      || raw.customer?.phone
      || raw.phone
      || cached?.customerPhone
      || '',
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
  const normalizedList = list.map(normalizeRequest).filter(Boolean);
  normalizedList.forEach(item => {
    if (item?.id) {
      cacheOrderDetails(item.id, {
        pickup: item.pickup,
        dropoff: item.dropoff,
        items: item.items,
        cat: item.cat,
        customerId: item.customerId,
      });
    }
  });
  return normalizedList;
}

/**
 * Fetch single request details by ID
 */
export async function fetchRequestById(requestId) {
  const response = await apiRequest(`/requests/${requestId}`, { method: 'GET' });
  const normalized = normalizeRequest(response?.data || response);
  if (normalized?.id) {
    cacheOrderDetails(normalized.id, {
      pickup: normalized.pickup,
      dropoff: normalized.dropoff,
      items: normalized.items,
      cat: normalized.cat,
      customerId: normalized.customerId,
    });
  }
  return normalized;
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
  const cat = String(category || 'food').toLowerCase().trim();
  const defaultPickup = DEFAULT_PICKUPS[cat] || "Bam-Bam's Canteen";
  const defaultDropoff = DEFAULT_DROPOFFS[cat] || 'Phelan P217 Lab';

  const chosenPickup = String(pickupAddress || defaultPickup).trim();
  const chosenDropoff = String(dropoffAddress || defaultDropoff).trim();

  const payload = {
    category: cat,
    itemDetails: String(itemDetails || '').trim(),
    pickup: {
      address: chosenPickup,
      instructions: pickupInstructions ? String(pickupInstructions).trim() : null,
    },
    dropoff: {
      address: chosenDropoff,
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

  const normalized = normalizeRequest(response?.data || response);
  if (normalized?.id) {
    cacheOrderDetails(normalized.id, {
      pickup: chosenPickup,
      dropoff: chosenDropoff,
      items: payload.itemDetails,
      title: payload.itemDetails,
      cat: payload.category,
    });
    normalized.pickup = chosenPickup;
    normalized.dropoff = chosenDropoff;
    normalized.items = payload.itemDetails;
    normalized.title = payload.itemDetails;
  }

  return normalized;
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
