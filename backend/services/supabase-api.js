const PROFILE_COLUMNS = 'id,display_name,phone,created_at,updated_at';
const REQUEST_COLUMNS = 'id,customer_id,assigned_runner_id,category,item_details,pickup_address,pickup_instructions,dropoff_address,dropoff_instructions,handoff_note,customer_estimate_minor,customer_estimate_currency,status,created_at,updated_at';

export class SupabaseApiError extends Error {
  constructor(message, { status = 503, code = 'SUPABASE_UNAVAILABLE' } = {}) {
    super(message);
    this.name = 'SupabaseApiError';
    this.status = status;
    this.code = code;
  }
}

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const createSupabaseApi = (config, fetchImpl = fetch) => {
  const configured = Boolean(config.supabaseUrl && config.supabasePublishableKey);

  const request = async (path, { token, method = 'GET', body, prefer, authRequest = false } = {}) => {
    if (!configured) {
      throw new SupabaseApiError('Supabase is not configured.', {
        status: 503,
        code: 'SUPABASE_NOT_CONFIGURED'
      });
    }

    const headers = {
      apikey: config.supabasePublishableKey,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (prefer) headers.Prefer = prefer;

    let response;
    try {
      response = await fetchImpl(`${config.supabaseUrl.replace(/\/$/, '')}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      throw new SupabaseApiError('Supabase could not be reached.');
    }

    const data = await parseJson(response);
    if (!response.ok) {
      if (authRequest && (response.status === 401 || response.status === 403)) {
        throw new SupabaseApiError('Authentication token is invalid or expired.', {
          status: 401,
          code: 'INVALID_TOKEN'
        });
      }
      if (response.status === 403) {
        throw new SupabaseApiError('Access to this Supabase resource is not allowed.', {
          status: 403,
          code: 'SUPABASE_ACCESS_DENIED'
        });
      }
      if (data?.code === 'P0001') {
        const isTransition = data.message === 'Action is not allowed from the current state';
        throw new SupabaseApiError('Request state does not allow this action.', {
          status: 409,
          code: isTransition ? 'INVALID_TRANSITION' : 'REQUEST_NOT_AVAILABLE'
        });
      }
      throw new SupabaseApiError('Supabase request failed.');
    }
    return data;
  };

  return Object.freeze({
    async verifyAccessToken(token) {
      const user = await request('/auth/v1/user', { token, authRequest: true });
      if (!user || typeof user.id !== 'string') {
        throw new SupabaseApiError('Supabase returned an invalid user response.', {
          status: 401,
          code: 'INVALID_TOKEN'
        });
      }
      return { id: user.id };
    },

    async getProfile(userId, token) {
      const query = new URLSearchParams({ select: PROFILE_COLUMNS, id: `eq.${userId}` });
      const rows = await request(`/rest/v1/profiles?${query}`, { token });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid profile response.');
      return rows[0] || null;
    },

    async saveProfile(userId, token, profile) {
      const query = new URLSearchParams({ on_conflict: 'id', select: PROFILE_COLUMNS });
      const rows = await request(`/rest/v1/profiles?${query}`, {
        token,
        method: 'POST',
        body: { id: userId, ...profile },
        prefer: 'resolution=merge-duplicates,return=representation'
      });
      if (!Array.isArray(rows) || !rows[0]) {
        throw new SupabaseApiError('Supabase returned an invalid profile response.');
      }
      return rows[0];
    },

    async createRequest(token, payload) {
      const rows = await request('/rest/v1/rpc/create_customer_request', {
        token,
        method: 'POST',
        body: payload
      });
      if (!Array.isArray(rows) || !rows[0]) {
        throw new SupabaseApiError('Supabase returned an invalid request response.');
      }
      return rows[0];
    },

    async listRequests(userId, token, { limit, cursor }) {
      const query = new URLSearchParams({
        select: REQUEST_COLUMNS,
        customer_id: `eq.${userId}`,
        order: 'created_at.desc,id.desc',
        limit: String(limit + 1)
      });
      if (cursor) {
        query.set('or', `(created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id}))`);
      }
      const rows = await request(`/rest/v1/requests?${query}`, { token });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid request list.');
      return rows;
    },

    async getRequest(userId, token, requestId) {
      const query = new URLSearchParams({
        select: REQUEST_COLUMNS,
        id: `eq.${requestId}`,
        customer_id: `eq.${userId}`,
        limit: '1'
      });
      const rows = await request(`/rest/v1/requests?${query}`, { token });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid request response.');
      return rows[0] || null;
    },

    async submitRunnerApplication(token) {
      const rows = await request('/rest/v1/rpc/submit_runner_application', { token, method: 'POST', body: {} });
      if (!Array.isArray(rows) || !rows[0]) throw new SupabaseApiError('Supabase returned an invalid application response.');
      return rows[0];
    },

    async getRunnerApplication(userId, token) {
      const query = new URLSearchParams({ select: 'user_id,status,created_at,updated_at', user_id: `eq.${userId}`, limit: '1' });
      const rows = await request(`/rest/v1/runner_applications?${query}`, { token });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid application response.');
      return rows[0] || null;
    },

    async listRunnerOpenRequests(token, { limit, cursor }) {
      const rows = await request('/rest/v1/rpc/list_runner_open_requests', {
        token, method: 'POST', body: {
          p_limit: limit,
          p_before_created_at: cursor?.createdAt ?? null,
          p_before_id: cursor?.id ?? null
        }
      });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid runner queue response.');
      return rows;
    },

    async listRunnerAssignedRequests(token, { limit, cursor }) {
      const rows = await request('/rest/v1/rpc/list_runner_assigned_requests', {
        token, method: 'POST', body: {
          p_limit: limit,
          p_before_created_at: cursor?.createdAt ?? null,
          p_before_id: cursor?.id ?? null
        }
      });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid assigned request response.');
      return rows;
    },

    async acceptRequest(token, requestId) {
      const rows = await request('/rest/v1/rpc/accept_delivery_request', { token, method: 'POST', body: { p_request_id: requestId } });
      if (!Array.isArray(rows) || !rows[0]) throw new SupabaseApiError('Supabase returned an invalid acceptance response.');
      return rows[0];
    },

    async advanceRequest(token, requestId, action) {
      const rows = await request('/rest/v1/rpc/advance_delivery_request', {
        token, method: 'POST', body: { p_request_id: requestId, p_action: action }
      });
      if (!Array.isArray(rows) || !rows[0]) throw new SupabaseApiError('Supabase returned an invalid lifecycle response.');
      return rows[0];
    },

    async reportRequestIssue(token, requestId, reason, description) {
      const rows = await request('/rest/v1/rpc/report_delivery_issue', {
        token, method: 'POST', body: { p_request_id: requestId, p_reason: reason, p_description: description }
      });
      if (!Array.isArray(rows) || !rows[0]) throw new SupabaseApiError('Supabase returned an invalid issue response.');
      return rows[0];
    },

    async listRequestEvents(requestId, token) {
      const rows = await request('/rest/v1/rpc/list_delivery_request_events', {
        token, method: 'POST', body: { p_request_id: requestId }
      });
      if (!Array.isArray(rows)) throw new SupabaseApiError('Supabase returned an invalid history response.');
      return rows;
    }
  });
};
