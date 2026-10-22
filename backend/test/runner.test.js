import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';
import { loadConfig } from '../config/env.js';

const runnerOne = '10000000-0000-4000-8000-000000000011';
const runnerTwo = '10000000-0000-4000-8000-000000000012';
const requestId = '20000000-0000-4000-8000-000000000011';
const testConfig = () => loadConfig({ NODE_ENV: 'test' });

const row = (status, runnerId) => ({
  id: requestId,
  customer_id: '10000000-0000-4000-8000-000000000001',
  assigned_runner_id: runnerId,
  category: 'food',
  item_details: 'Private detailed item description',
  pickup_address: 'Private pickup address',
  pickup_instructions: 'Private pickup instructions',
  dropoff_address: 'Private drop-off address',
  dropoff_instructions: null,
  handoff_note: 'Private handoff note',
  customer_estimate_minor: null,
  customer_estimate_currency: null,
  status,
  created_at: '2026-10-22T07:00:00.000Z',
  updated_at: '2026-10-22T07:00:00.000Z'
});

const withServer = async (app, run) => {
  const server = app.listen(0);
  await once(server, 'listening');
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { server.close(); await once(server, 'close'); }
};

test('runner application is pending until trusted eligibility is set', async () => {
  const api = {
    async verifyAccessToken() { return { id: runnerOne }; },
    async submitRunnerApplication() { return { user_id: runnerOne, status: 'pending' }; },
    async getRunnerApplication() { return { user_id: runnerOne, status: 'pending' }; },
    async listRunnerOpenRequests() { assert.fail('ineligible queue must not reach storage'); }
  };
  const app = createApp(testConfig(), { supabaseApi: api });
  await withServer(app, async (baseUrl) => {
    const submitted = await fetch(`${baseUrl}/api/v1/runner/application`, {
      method: 'POST', headers: { authorization: 'Bearer runner-token', 'content-type': 'application/json' }, body: '{}'
    });
    assert.equal(submitted.status, 201);
    assert.equal((await submitted.json()).data.status, 'pending');
    const queue = await fetch(`${baseUrl}/api/v1/runner/requests`, { headers: { authorization: 'Bearer runner-token' } });
    assert.equal(queue.status, 403);
    assert.equal((await queue.json()).error.code, 'RUNNER_NOT_ELIGIBLE');
  });
});

test('open queue uses a restricted projection with no personal or precise request fields', async () => {
  const api = {
    async verifyAccessToken() { return { id: runnerOne }; },
    async getRunnerApplication() { return { user_id: runnerOne, status: 'eligible' }; },
    async listRunnerOpenRequests() { return [{ id: requestId, category: 'food', item_summary: 'Request in food', pickup_area: null, dropoff_area: null, status: 'open', quote: null, created_at: '2026-10-22T07:00:00Z' }]; }
  };
  const app = createApp(testConfig(), { supabaseApi: api });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/runner/requests`, { headers: { authorization: 'Bearer runner-token' } });
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(payload.data[0], {
      id: requestId, category: 'food', itemSummary: 'Request in food', pickupArea: null,
      dropoffArea: null, status: 'open', quote: null, createdAt: '2026-10-22T07:00:00Z'
    });
    assert.equal(JSON.stringify(payload).includes('Private pickup address'), false);
  });
});

test('atomic acceptance allows one runner and rejects a competing runner', async () => {
  let accepted = false;
  const api = {
    async verifyAccessToken(token) { return { id: token === 'runner-one' ? runnerOne : runnerTwo }; },
    async getRunnerApplication(userId) { return { user_id: userId, status: 'eligible' }; },
    async acceptRequest(token, id) {
      assert.equal(id, requestId);
      if (accepted) throw Object.assign(new Error('Already accepted.'), { status: 409, code: 'REQUEST_NOT_AVAILABLE' });
      accepted = true;
      return row('accepted', token === 'runner-one' ? runnerOne : runnerTwo);
    }
  };
  const app = createApp(testConfig(), { supabaseApi: api });
  await withServer(app, async (baseUrl) => {
    const accept = (token) => fetch(`${baseUrl}/api/v1/requests/${requestId}/accept`, {
      method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: '{}'
    });
    const responses = await Promise.all([accept('runner-one'), accept('runner-two')]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [200, 409]);
  });
});

test('runner lifecycle rejects invalid actions and records valid history', async () => {
  const calls = [];
  const api = {
    async verifyAccessToken() { return { id: runnerOne }; },
    async getRunnerApplication() { return { user_id: runnerOne, status: 'eligible' }; },
    async advanceRequest(_token, id, action) {
      calls.push(action);
      if (action === 'mark_delivered') return row('delivered', runnerOne);
      throw Object.assign(new Error('Action not allowed.'), { status: 409, code: 'INVALID_TRANSITION' });
    },
    async listRequestEvents() { return [{ id: 'event-1', event_type: 'delivery_marked_delivered', from_status: 'in_progress', to_status: 'delivered', details: {}, created_at: '2026-10-22T08:00:00Z' }]; }
  };
  const app = createApp(testConfig(), { supabaseApi: api });
  await withServer(app, async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/api/v1/requests/${requestId}/lifecycle`, {
      method: 'POST', headers: { authorization: 'Bearer runner-token', 'content-type': 'application/json' }, body: JSON.stringify({ action: 'cancel' })
    });
    assert.equal(invalid.status, 422);
    assert.deepEqual(calls, []);
    const valid = await fetch(`${baseUrl}/api/v1/requests/${requestId}/lifecycle`, {
      method: 'POST', headers: { authorization: 'Bearer runner-token', 'content-type': 'application/json' }, body: JSON.stringify({ action: 'mark_delivered' })
    });
    assert.equal(valid.status, 200);
    assert.equal((await valid.json()).data.status, 'delivered');
    const history = await fetch(`${baseUrl}/api/v1/requests/${requestId}/events`, { headers: { authorization: 'Bearer runner-token' } });
    assert.equal((await history.json()).data[0].toStatus, 'delivered');
  });
});

test('customer issue reports are validated and recorded through the request event service', async () => {
  const api = {
    async verifyAccessToken() { return { id: '10000000-0000-4000-8000-000000000001' }; },
    async reportRequestIssue(_token, id, reason, description) {
      assert.equal(id, requestId);
      assert.equal(reason, 'item concern');
      assert.equal(description, 'Package seal looked damaged.');
      return row('issue_reported', runnerOne);
    }
  };
  const app = createApp(testConfig(), { supabaseApi: api });
  await withServer(app, async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/api/v1/requests/${requestId}/issues`, {
      method: 'POST', headers: { authorization: 'Bearer customer-token', 'content-type': 'application/json' }, body: JSON.stringify({ reason: '  ' })
    });
    assert.equal(invalid.status, 422);
    const valid = await fetch(`${baseUrl}/api/v1/requests/${requestId}/issues`, {
      method: 'POST', headers: { authorization: 'Bearer customer-token', 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'item concern', description: 'Package seal looked damaged.' })
    });
    assert.equal(valid.status, 200);
    assert.equal((await valid.json()).data.status, 'issue_reported');
  });
});
