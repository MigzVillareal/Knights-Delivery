const PROFILE_COLUMNS = 'id,display_name,phone,created_at,updated_at';

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
    }
  });
};
