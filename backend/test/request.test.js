import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';
import { loadConfig } from '../config/env.js';
import { createSupabaseApi } from '../services/supabase-api.js';
import { validateCreateRequest, validateRequestListQuery } from '../validators/request.validator.js';

const ownerId = '10000000-0000-4000-8000-000000000001';
const otherId = '10000000-0000-4000-8000-000000000002';
const requestId = '20000000-0000-4000-8000-000000000001';
const testConfig = () => loadConfig({ NODE_ENV: 'test' });

const validBody = {
  category: 'food',
  itemDetails: 'Pick up the sealed order',
  pickup: { address: 'Pickup point', instructions: 'Ask at the counter' },
  dropoff: { address: 'Building 2 room 301', instructions: null },
  handoffNote: 'Text on arrival',
  customerEstimate: { amountMinor: 1234, currency: 'PHP' }
};

const rowFor = (overrides = {}) => ({
  id: requestId,
  customer_id: ownerId,
  assigned_runner_id: null,
  category: 'food',
  item_details: 'Pick up the sealed order',
  pickup_address: 'Pickup point',
  pickup_instructions: 'Ask at the counter',
  dropoff_address: 'Building 2 room 301',
  dropoff_instructions: null,
  handoff_note: 'Text on arrival',
  customer_estimate_minor: 1234,
  customer_estimate_currency: 'PHP',
  status: 'awaiting_policy',
  created_at: '2026-10-22T07:00:00.000Z',
  updated_at: '2026-10-22T07:00:00.000Z',
  ...overrides
});

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

test('validates customer request fields without hardcoding allowed categories or fees', () => {
  const result = validateCreateRequest(validBody);
  assert.equal(result.error, undefined);
  assert.equal(result.value.category, 'food');
  assert.equal(result.value.customerEstimate.amountMinor, 1234);

  assert.equal(validateCreateRequest({ ...validBody, category: 'Food Category!' }).error.field, 'category');
  assert.equal(validateCreateRequest({ ...validBody, pickup: { address: 'x', userId: otherId } }).error.field, 'pickup.userId');
  assert.equal(validateCreateRequest({ ...validBody, customerEstimate: { amountMinor: -1, currency: 'PHP' } }).error.field, 'customerEstimate.amountMinor');
  assert.equal(validateCreateRequest({ ...validBody, status: 'open' }).error.field, 'status');
  assert.equal(validateCreateRequest({ ...validBody, paymentMethod: 'GCash' }).error.field, 'paymentMethod');
});

test('validates pagination limits and opaque owner-scoped cursors', () => {
  assert.deepEqual(validateRequestListQuery({ limit: '25' }).value, { limit: 25, cursor: null });
  assert.equal(validateRequestListQuery({ limit: '101' }).error.field, 'limit');
  assert.equal(validateRequestListQuery({ cursor: 'not-a-cursor' }).error.field, 'cursor');
});

test('creates a customer request as policy-pending without making a fee or posting it', async () => {
  let createCall;
  const api = {
    async verifyAccessToken(token) { assert.equal(token, 'customer-token'); return { id: ownerId }; },
    async createRequest(token, payload) {
      createCall = { token, payload };
      return rowFor();
    }
  };
  const app = createApp(testConfig(), { supabaseApi: api });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/requests`, {
      method: 'POST',
      headers: { authorization: 'Bearer customer-token', 'content-type': 'application/json' },
      body: JSON.stringify(validBody)
    });
    assert.equal(response.status, 201);
    const { data } = await response.json();
    assert.equal(data.id, requestId);
    assert.equal(data.status, 'awaiting_policy');
    assert.deepEqual(data.posting, { enabled: false, reason: 'POLICY_NOT_CONFIGURED' });
    assert.equal(data.quote, null);
    assert.deepEqual(data.customerEstimate, { amountMinor: 1234, currency: 'PHP' });
    assert.equal(createCall.token, 'customer-token');
    assert.deepEqual(createCall.payload, {
      p_category: 'food',
      p_item_details: 'Pick up the sealed order',
      p_pickup_address: 'Pickup point',
      p_pickup_instructions: 'Ask at the counter',
      p_dropoff_address: 'Building 2 room 301',
      p_dropoff_instructions: null,
      p_handoff_note: 'Text on arrival',
      p_customer_estimate_minor: 1234,
      p_customer_estimate_currency: 'PHP'
    });
  });
});

test('invalid request does not reach Supabase and returns documented validation details', async () => {
  let createCalls = 0;
  const api = {
    async verifyAccessToken() { return { id: ownerId }; },
    async createRequest() { createCalls += 1; }
  };
  const app = createApp(testConfig(), { supabaseApi: api });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/requests`, {
      method: 'POST',
      headers: { authorization: 'Bearer customer-token', 'content-type': 'application/json' },
      body: JSON.stringify({ ...validBody, pickup: { address: ' ' } })
    });
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.deepEqual(body.error.details, [{ field: 'pickup.address', issue: 'Required.' }]);
    assert.equal(createCalls, 0);
  });
});

test('customer list and detail stay scoped to the verified caller', async () => {
  const api = {
    async verifyAccessToken() { return { id: ownerId }; },
    async listRequests(userId, token, page) {
      assert.equal(userId, ownerId);
      assert.equal(token, 'customer-token');
      assert.deepEqual(page, { limit: 1, cursor: null });
      return [rowFor(), rowFor({ id: '20000000-0000-4000-8000-000000000002', created_at: '2026-10-21T07:00:00.000Z' })];
    },
    async getRequest(userId, token, id) {
      assert.equal(userId, ownerId);
      assert.equal(token, 'customer-token');
      return id === requestId ? rowFor() : null;
    }
  };
  const app = createApp(testConfig(), { supabaseApi: api });

  await withServer(app, async (baseUrl) => {
    const list = await fetch(`${baseUrl}/api/v1/requests?limit=1`, { headers: { authorization: 'Bearer customer-token' } });
    assert.equal(list.status, 200);
    const listBody = await list.json();
    assert.equal(listBody.data.length, 1);
    assert.ok(listBody.page.nextCursor);

    const detail = await fetch(`${baseUrl}/api/v1/requests/${requestId}`, { headers: { authorization: 'Bearer customer-token' } });
    assert.equal(detail.status, 200);
    assert.equal((await detail.json()).data.id, requestId);

    const other = await fetch(`${baseUrl}/api/v1/requests/20000000-0000-4000-8000-000000000099`, {
      headers: { authorization: 'Bearer customer-token' }
    });
    assert.equal(other.status, 404);
    assert.equal((await other.json()).error.code, 'NOT_FOUND');
  });
});

test('request rows returned by storage cannot leak across customers', async () => {
  const api = {
    async verifyAccessToken() { return { id: ownerId }; },
    async listRequests() { return [rowFor({ customer_id: otherId })]; }
  };
  const app = createApp(testConfig(), { supabaseApi: api });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/requests`, { headers: { authorization: 'Bearer customer-token' } });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, 'SUPABASE_RESPONSE_INVALID');
  });
});

test('request REST adapter uses authenticated RPC for atomic request and event creation', async () => {
  let call;
  const api = createSupabaseApi(loadConfig({
    NODE_ENV: 'test', SUPABASE_URL: 'https://project.example.test', SUPABASE_PUBLISHABLE_KEY: 'publishable-key'
  }), async (url, options) => {
    call = { url, options };
    return Response.json([rowFor()], { status: 200 });
  });
  const response = await api.createRequest('user-token', { p_category: 'food' });
  assert.equal(response.id, requestId);
  assert.equal(call.url, 'https://project.example.test/rest/v1/rpc/create_customer_request');
  assert.equal(call.options.headers.Authorization, 'Bearer user-token');
  assert.deepEqual(JSON.parse(call.options.body), { p_category: 'food' });
});
