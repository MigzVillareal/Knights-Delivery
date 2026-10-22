import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';
import { loadConfig, ConfigurationError } from '../config/env.js';
import { logEvent } from '../services/logger.js';

const testConfig = (overrides = {}) => loadConfig({ NODE_ENV: 'test', ...overrides });

const withServer = async (app, run) => {
  const server = app.listen(0);
  await once(server, 'listening');
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
};

test('loads documented defaults and rejects invalid configuration', () => {
  const config = loadConfig({});
  assert.equal(config.port, 5000);
  assert.equal(config.nodeEnv, 'development');
  assert.deepEqual(config.corsOrigins, ['http://localhost:5173', 'http://localhost:3000']);
  assert.equal(config.jsonBodyLimit, '100kb');
  assert.throws(() => loadConfig({ PORT: '0' }), ConfigurationError);
  assert.throws(() => loadConfig({ CORS_ORIGINS: '*' }), ConfigurationError);
  assert.throws(() => loadConfig({ NODE_ENV: 'staging' }), ConfigurationError);
});

test('preserves root response and returns versioned secret-free health', async () => {
  const app = createApp(testConfig());
  await withServer(app, async (baseUrl) => {
    const root = await fetch(`${baseUrl}/`);
    assert.equal(root.status, 200);
    assert.equal(await root.text(), 'API is running...');

    const health = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(health.status, 200);
    assert.match(health.headers.get('x-request-id'), /^[\da-f-]{36}$/i);
    assert.deepEqual(await health.json(), {
      data: { status: 'ok', service: 'knights-delivery-api' }
    });
  });
});

test('uses the consistent error shape for unknown routes and malformed JSON', async () => {
  const app = createApp(testConfig());
  await withServer(app, async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/v1/missing`);
    assert.equal(missing.status, 404);
    assert.deepEqual(Object.keys((await missing.json()).error).sort(), ['code', 'message', 'requestId']);

    const malformed = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{'
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).error.code, 'MALFORMED_JSON');
  });
});

test('allows configured CORS origin and omits access control for unconfigured origin', async () => {
  const app = createApp(testConfig({ CORS_ORIGINS: 'https://app.example.test' }));
  await withServer(app, async (baseUrl) => {
    const allowed = await fetch(`${baseUrl}/api/v1/health`, { headers: { origin: 'https://app.example.test' } });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://app.example.test');

    const denied = await fetch(`${baseUrl}/api/v1/health`, { headers: { origin: 'https://other.example.test' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
  });
});

test('rejects JSON bodies over configured size', async () => {
  const app = createApp(testConfig({ JSON_BODY_LIMIT: '10b' }));
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tooLarge: 'this request is definitely over ten bytes' })
    });
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error.code, 'PAYLOAD_TOO_LARGE');
  });
});

test('structured logger redacts credentials and personal request fields', () => {
  const originalLog = console.log;
  let line = '';
  console.log = (value) => { line = value; };
  try {
    logEvent('test.event', {
      authorization: 'Bearer private-token',
      phone: '+639000000000',
      address: 'Private address',
      safeCount: 3
    });
  } finally {
    console.log = originalLog;
  }
  const record = JSON.parse(line);
  assert.equal(record.authorization, '[REDACTED]');
  assert.equal(record.phone, '[REDACTED]');
  assert.equal(record.address, '[REDACTED]');
  assert.equal(record.safeCount, 3);
});
