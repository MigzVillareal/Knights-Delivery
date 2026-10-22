import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';
import { loadConfig, ConfigurationError } from '../config/env.js';
import { createSupabaseApi } from '../services/supabase-api.js';

const userId = '10000000-0000-4000-8000-000000000001';
const config = (extra = {}) => loadConfig({ NODE_ENV: 'test', ...extra });

const withServer = async (app, run) => {
  const server = app.listen(0);
  await once(server, 'listening');
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
};

test('Supabase configuration requires a URL and publishable key together', () => {
  assert.throws(() => config({ SUPABASE_URL: 'https://project.example.test' }), ConfigurationError);
  assert.throws(() => config({ SUPABASE_URL: 'javascript:alert(1)', SUPABASE_PUBLISHABLE_KEY: 'key' }), ConfigurationError);
  const parsed = config({ SUPABASE_URL: 'https://project.example.test/', SUPABASE_PUBLISHABLE_KEY: 'publishable-test-key' });
  assert.equal(parsed.supabaseUrl, 'https://project.example.test');
});

test('profile routes require a verified token and return only the token owner profile', async () => {
  const calls = [];
  const supabaseApi = {
    async verifyAccessToken(token) {
      calls.push(['verify', token]);
      if (token === 'expired') {
        const error = new Error('invalid token');
        error.status = 401;
        error.code = 'INVALID_TOKEN';
        throw error;
      }
      return { id: userId };
    },
    async getProfile(id, token) {
      calls.push(['get', id, token]);
      return { id, display_name: 'Test User', phone: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' };
    },
    async saveProfile(id, token, update) {
      calls.push(['save', id, token, update]);
      return { id, display_name: update.display_name ?? 'Test User', phone: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z' };
    }
  };
  const app = createApp(config(), { supabaseApi });

  await withServer(app, async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/v1/profile`);
    assert.equal(missing.status, 401);

    const invalid = await fetch(`${baseUrl}/api/v1/profile`, { headers: { authorization: 'Bearer expired' } });
    assert.equal(invalid.status, 401);
    assert.equal((await invalid.json()).error.code, 'INVALID_TOKEN');

    const response = await fetch(`${baseUrl}/api/v1/profile`, { headers: { authorization: 'Bearer valid-user-token' } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, {
      id: userId,
      displayName: 'Test User',
      phone: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    });
    assert.deepEqual(calls.find((call) => call[0] === 'get'), ['get', userId, 'valid-user-token']);
  });
});

test('profile updates derive identity from the verified token and reject role or identity changes', async () => {
  const writes = [];
  const supabaseApi = {
    async verifyAccessToken() { return { id: userId }; },
    async saveProfile(id, token, update) {
      writes.push({ id, token, update });
      return { id, display_name: update.display_name ?? null, phone: update.phone ?? null };
    }
  };
  const app = createApp(config(), { supabaseApi });

  await withServer(app, async (baseUrl) => {
    const allowed = await fetch(`${baseUrl}/api/v1/profile`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer signed-in-token', 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: '  Example  ', phone: null })
    });
    assert.equal(allowed.status, 200);
    assert.equal(writes[0].id, userId);
    assert.equal(writes[0].token, 'signed-in-token');
    assert.deepEqual(writes[0].update, { display_name: 'Example', phone: null });

    const denied = await fetch(`${baseUrl}/api/v1/profile`, {
      method: 'PATCH',
      headers: { authorization: 'Bearer signed-in-token', 'content-type': 'application/json' },
      body: JSON.stringify({ id: '10000000-0000-4000-8000-000000000002', capabilities: ['operations'] })
    });
    assert.equal(denied.status, 422);
    assert.equal((await denied.json()).error.code, 'VALIDATION_ERROR');
    assert.equal(writes.length, 1);
  });
});

test('configured API verifies through Supabase Auth and sends the same user token to profile storage', async () => {
  const calls = [];
  const api = createSupabaseApi(config({
    SUPABASE_URL: 'https://project.example.test',
    SUPABASE_PUBLISHABLE_KEY: 'publishable-test-key'
  }), async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/auth/v1/user')) {
      return Response.json({ id: userId, email: 'ignored@example.test' }, { status: 200 });
    }
    if (url.includes('/rest/v1/profiles?')) {
      return Response.json([], { status: 200 });
    }
    throw new Error('Unexpected URL');
  });

  assert.deepEqual(await api.verifyAccessToken('verified-token'), { id: userId });
  assert.equal(await api.getProfile(userId, 'verified-token'), null);
  assert.equal(calls[0].options.headers.apikey, 'publishable-test-key');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer verified-token');
  assert.match(calls[1].url, /id=eq\.10000000-0000-4000-8000-000000000001/);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer verified-token');
});

test('profile endpoints return unavailable when Supabase is not configured', async () => {
  const app = createApp(config());
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/profile`, { headers: { authorization: 'Bearer any-token' } });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, 'SUPABASE_NOT_CONFIGURED');
  });
});
