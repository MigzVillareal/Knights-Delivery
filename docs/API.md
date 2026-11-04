# Knights Delivery API: Contract and Repository Findings

**Status:** Health, profile, customer request, runner queue/acceptance, lifecycle, issue, and request-history routes are implemented. Courier features require authentication but no application or eligibility review. A migration removes the old access gate while retaining old application records.

## Repository findings

### Runtime and structure

- The backend is an Express application using ES modules. `backend/server.js` loads dotenv, validates configuration, creates the app, and starts the HTTP server. B2 removed the legacy MongoDB connection from startup. B3–B5 use Supabase Auth and PostgREST through user-scoped access tokens.
- The current server port is `PORT` or `5000`. `CORS_ORIGINS` configures explicit allowed origins, defaulting to `http://localhost:5173` and `http://localhost:3000`; credentials are enabled. `JSON_BODY_LIMIT` configures the JSON parser limit, defaulting to `100kb`. `NODE_ENV` accepts development, test, or production and is used in startup logging.
- `backend/config/db.js` and the Mongoose model remain in the repository as legacy files, but the server does not import or call them. Supabase/PostgreSQL schema and user-scoped REST access are implemented in source; the migration has not yet been applied to a Supabase project.
- Backend scripts: `npm start` runs `node server.js`; `npm run dev` runs `nodemon server.js`.
- `backend/package.json` declares Express `^4.19.2`, Mongoose `^8.3.0`, dotenv `^16.4.5`, and cors `^2.8.5`, with nodemon `^3.1.0` for development. The checked-in lockfile declares materially different ranges/versions for cors, dotenv, Express, and Mongoose (including Express 5 and Mongoose 9). Reconcile the manifest and lockfile in a later implementation phase.
- The backend uses `routes/`, `controllers/`, `services/`, `validators/`, and `middleware/` layers. Implemented versioned routes include health, profile, customer requests, runner queue/acceptance, lifecycle, issue reporting, and event history.
- `backend/README.md` documents local setup and Supabase migration commands. The root README contains only the project heading.
- Runtime configuration references `PORT`, `NODE_ENV`, `CORS_ORIGINS`, and `JSON_BODY_LIMIT`. Supabase routes also use `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; both must be configured together. The legacy `config/db.js` references `MONGO_URI`, but it is not used by the current server. A local `backend/.env` file exists, but its contents were not inspected; do not copy secrets into documentation.
- `models/User.js` has username, password, and a `user`/`courier` role shape. It is not an implemented authentication flow and should not be carried forward as a password-storage design when Supabase Auth is introduced.

### Existing backend endpoints

| Method | Path | Current behavior | Auth |
|---|---|---|---|
| `GET` | `/` | Returns plain text indicating the API is running. | None |
| `GET` | `/api/v1/health` | Returns `{ "data": { "status": "ok", "service": "knights-delivery-api" } }`; exposes no configuration or secrets. | None |
| `GET` | `/api/v1/profile` | Returns the caller’s own profile. | Supabase Auth bearer token |
| `PATCH` | `/api/v1/profile` | Updates only the caller’s `displayName` and `phone`. | Supabase Auth bearer token |
| `POST` | `/api/v1/requests` | Saves a validated customer request as `open`, making it available in the runner queue under the temporary bypass. No payable quote or settlement is configured. | Supabase Auth bearer token |
| `GET` | `/api/v1/requests?limit=&cursor=` | Lists only the caller’s requests. | Supabase Auth bearer token |
| `GET` | `/api/v1/requests/{requestId}` | Reads only the caller’s request; other users’ or missing requests return the same `404`. | Supabase Auth bearer token |
| `GET` | `/api/v1/runner/requests?limit=&cursor=` | Lists open requests for any signed-in user with a restricted projection. | Supabase Auth bearer token |
| `GET` | `/api/v1/runner/requests/assigned?limit=&cursor=` | Lists the caller’s assigned requests with fulfillment details. | Supabase Auth bearer token |
| `POST` | `/api/v1/requests/{requestId}/accept` | Atomically accepts an open request for one signed-in user. | Supabase Auth bearer token |
| `POST` | `/api/v1/requests/{requestId}/lifecycle` | Advances the caller’s assigned work with `start` or `mark_delivered`. | Assigned runner bearer token |
| `POST` | `/api/v1/requests/{requestId}/issues` | Reports an issue for a customer-owned or assigned request. | Customer or assigned runner bearer token |
| `GET` | `/api/v1/requests/{requestId}/events` | Reads request history for the customer or assigned runner. | Customer or assigned runner bearer token |

Operations endpoints remain unimplemented. Supabase-backed routes return `503 SUPABASE_NOT_CONFIGURED` until the project URL and publishable key are configured.

### Frontend and product documents

- The frontend is a React 19 + React DOM 19 application built with Vite 6 and `@vitejs/plugin-react` 4. Its package scripts are `dev`, `build`, and `preview`; no test script is declared in the inspected package manifest.
- The frontend is a web app with responsive customer and runner screens. The current request, session, and sign-in demonstrations live in React state and are not sent to the backend. Refresh therefore clears that in-memory activity.
- The frontend README describes a minimal presentation-only shell and is stale relative to the current component-based prototype. The root README is also not an operational guide.
- The frontend contains sample identities, addresses, contact-like values, fee values, service claims, and request statuses. These are prototype fixtures, not approved production policy, and should not be copied into production seeds or treated as API truth.
- The UI’s mock fee table includes category values and the FAQ contains fee ranges and other service claims. Product documents do not establish those as approved policy. The UI’s current lifecycle labels also differ from the proposed lifecycle below; integration will need an explicit mapping.
- The product assessment and master plan identify Supabase Auth/PostgreSQL as the intended backend direction and call for keeping controllers, routes, services, and validators. Some planning text says no repository files were available; that description is stale because this inspection found backend and frontend files in the repository.

## Proposed API conventions

### Base URL and authentication

Use `/api/v1` for application endpoints. Keep `GET /` temporarily for compatibility; `GET /api/v1/health` reports service availability without exposing configuration or secrets.

Use Supabase Auth for credential sign-up, sign-in, and token refresh. The frontend obtains a Supabase access token and sends it to the Express API as:

```http
Authorization: Bearer <supabase-access-token>
```

The API validates the token and derives the user identity from its verified subject (`sub`). It must not accept a client-supplied user ID as proof of identity. This contract does not add Express password endpoints.

All signed-in accounts can use customer and courier endpoints. Operations access remains unimplemented and must not be inferred from a client-side role choice.

### JSON response and errors

Successful JSON responses use a `data` envelope. Collection responses may include `page` metadata:

```json
{
  "data": {},
  "page": { "limit": 20, "nextCursor": null }
}
```

Errors use one stable shape. Do not return stack traces, SQL details, provider tokens, or secret configuration:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields need attention.",
    "details": [{ "field": "dropoff.address", "issue": "Required" }],
    "requestId": "server-generated-id"
  }
}
```

`details` and `requestId` may be omitted when unavailable. Proposed HTTP mapping:

| HTTP | Use |
|---|---|
| `400` | Malformed JSON or malformed request syntax. |
| `413` | Request body exceeds the configured JSON size limit. |
| `401` | Missing, invalid, or expired authentication token. |
| `403` | Authenticated user lacks capability or access to the resource. |
| `404` | Resource does not exist or is not visible to this caller. |
| `409` | State conflict, duplicate idempotency key, or required policy is not configured. |
| `422` | Well-formed request fails field validation or a business rule. |
| `429` | Rate limit exceeded, if rate limiting is configured. |
| `500` | Unexpected server error with a generic message. |
| `503` | Required persistence or auth dependency is unavailable. |

Names and status mapping in this contract define the backend shape; frontend mapping remains future work.

### Common resource shapes

IDs are opaque strings. Timestamps are ISO 8601 UTC strings. Money should be represented as integer minor units plus an explicit currency code once approved; no currency or amount is selected by this document.

```json
{
  "id": "opaque-id",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

Pagination uses `limit` and an opaque `cursor`. The maximum page size and sort order require product/operations decisions.

## Versioned routes

Routes labeled implemented below are available in the Express API. Operations routes remain proposed and unimplemented.

### Auth context and profile

Authentication itself is handled by Supabase Auth SDK flows, not these Express routes.

| Method and path | Auth | Purpose |
|---|---|---|
| `GET /api/v1/auth/context` | Signed-in user | Return the verified caller’s ID and capabilities for app routing. Proposed. |
| `GET /api/v1/profile` | Signed-in user | Read the caller’s own profile. Implemented in B3. |
| `PATCH /api/v1/profile` | Signed-in user | Update `displayName` and `phone` on the caller’s own profile. Implemented in B3. |

`GET /auth/context` response:

```json
{
  "data": {
    "userId": "opaque-id",
    "capabilities": ["customer"],
    "profileComplete": true
  }
}
```

Current profile response shape:

```json
{
  "data": {
    "id": "opaque-id",
    "displayName": "Example name",
    "phone": null,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}
```

`PATCH /api/v1/profile` accepts `displayName` and `phone` only; each may be null. Clients cannot patch user ID or operations access. Supabase Auth verifies the bearer token and the same user token scopes profile reads and writes through row-level security. A profile row is created on first update; a read before that returns null profile fields. Phone verification/requirement and collection remain unresolved.

### Customer requests

| Method and path | Auth | Purpose |
|---|---|---|
| `POST /api/v1/requests` | Customer | Implemented in B4. Validates and saves a customer-owned request. |
| `GET /api/v1/requests?limit=&cursor=` | Customer | Implemented in B4. Lists only the caller’s requests. |
| `GET /api/v1/requests/{requestId}` | Request owner | Implemented in B4. Other callers and missing IDs receive the same `404`. |
| `POST /api/v1/requests/{requestId}/cancel` | Request owner; operations | Request cancellation when current state and policy allow it. |
| `POST /api/v1/requests/{requestId}/confirm-completion` | Request owner | Confirm completion if the chosen lifecycle requires customer confirmation. |
| `POST /api/v1/requests/{requestId}/issues` | Customer or assigned runner | Implemented in B5; stores the issue in request history. |

Proposed create body:

```json
{
  "category": "food",
  "itemDetails": "Pick up the specified items",
  "pickup": {
    "address": "Pickup address",
    "instructions": "Optional pickup directions"
  },
  "dropoff": {
    "address": "Precise drop-off address",
    "instructions": "Optional drop-off directions"
  },
  "handoffNote": "Optional handoff note",
  "customerEstimate": {
    "amountMinor": 1234,
    "currency": "ABC"
  }
}
```

This is a shape example only; `ABC` is a placeholder currency code. The implemented validator accepts a lowercase category identifier without deciding the approved category list. `customerEstimate` is optional, retained only as the customer-provided estimate, and never authoritative. The temporary bypass saves requests as `open` so they appear in the runner queue, but no payable quote, courier payout, or settlement is calculated or stored. The `customerEstimate` amount and currency do not set a payout quote.

Proposed request response:

```json
{
  "data": {
    "id": "opaque-id",
    "status": "open",
    "category": "food",
    "itemDetails": "Pick up the specified items",
    "pickup": { "address": "Pickup address", "instructions": null },
    "dropoff": { "address": "Precise drop-off address", "instructions": null },
    "handoffNote": null,
    "customerEstimate": null,
    "quote": null,
    "posting": { "enabled": true, "reason": null },
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}
```

Do not put full precise addresses, phone numbers, or handoff details into a runner’s open queue. A customer’s own detail response and an assigned runner’s detail response can include the precise fields needed for fulfillment, subject to approved access rules.

### Runner discovery and acceptance

| Method and path | Auth | Purpose |
|---|---|---|
| `GET /api/v1/runner/requests?limit=&cursor=` | Eligible runner | List open requests with a restricted pre-acceptance projection. Implemented in B5. |
| `GET /api/v1/runner/requests/assigned?limit=&cursor=` | Eligible runner | List requests assigned to the caller. Implemented in B5. |
| `POST /api/v1/requests/{requestId}/accept` | Eligible runner | Atomically accept one open request. Implemented in B5. |
| `PATCH /api/v1/runner/availability` | Eligible runner | Update availability if the pilot uses runner availability. |

There is no runner application or eligibility review route. Any authenticated user can query and accept open requests. Assignment ownership, request-state checks, and atomic single-winner acceptance remain enforced by the database.

Open queue item (implemented shape):

```json
{
  "id": "opaque-id",
  "category": "food",
  "itemSummary": "Short non-sensitive summary",
  "pickupArea": null,
  "dropoffArea": null,
  "status": "open",
  "quote": null,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

The queue currently returns a generic category-based summary, null pickup/drop-off areas, and a null quote. It exposes no precise address, customer contact data, or handoff notes. Those fields stay unavailable until a successful assignment; the assigned-request view then returns fulfillment addresses and instructions. Pagination uses the standard `limit`/`cursor` response.

Acceptance has an empty JSON body. It is atomic in a Supabase function: only one authenticated user can transition an open request to accepted. Response returns the newly assigned request or `409 REQUEST_NOT_AVAILABLE` if another runner won or the request changed state. Acceptance and its `request_events` history entry commit together.

### Lifecycle and issue reporting

Canonical lifecycle values in the schema:

`open` → `accepted` → `in_progress` → `delivered` → `completed`

Terminal/exception states: `cancelled`, `issue_reported`, `resolved`.

| Method and path | Auth | Purpose |
|---|---|---|
| `POST /api/v1/requests/{requestId}/lifecycle` | Assigned runner | Implemented actions: `start` (`accepted` → `in_progress`) and `mark_delivered` (`in_progress` → `delivered`). |
| `POST /api/v1/requests/{requestId}/issues` | Customer or assigned runner | Report an issue from `accepted`, `in_progress`, or `delivered`; records an `issue_reported` history event and changes status. |
| `GET /api/v1/requests/{requestId}/events` | Customer or assigned runner | Read request history; includes issue details visible to these participants. |

Proposed lifecycle body:

```json
{
  "action": "start"
}
```

Only `start` and `mark_delivered` are enabled. Arbitrary statuses, completion confirmation, cancellation, and resolution are rejected or unavailable because their rules are unresolved. Do not accept an arbitrary client-supplied status string.

Issue body:

```json
{
  "reason": "other",
  "description": "Optional description"
}
```

`reason` is required free text up to 100 characters; `description` is optional up to 1000 characters. No reason-code set, attachment support, response target, or resolution action is defined. Issue information is stored in the request event history, not a separate issue table.

The current prototype status names (`finding`, `accepted`, `picked`, `on_way`, `arriving`, `delivered`, `cancelled`) are UI mock states. They are not backend states and need an explicit mapping before frontend integration.

### Operations

Operations access is restricted to a server-controlled `operations` capability; clients cannot grant it to themselves.

| Method and path | Auth | Purpose |
|---|---|---|
| `GET /api/v1/operations/runner-applications?status=&limit=&cursor=` | Operations | Review applications. |
| `POST /api/v1/operations/runner-applications/{applicationId}/decision` | Operations | Approve, reject, or request more information, if those outcomes are adopted. |
| `GET /api/v1/operations/requests?status=&limit=&cursor=` | Operations | Search requests under an approved access policy. |
| `GET /api/v1/operations/issues?status=&limit=&cursor=` | Operations | Review open issues. |
| `POST /api/v1/operations/issues/{issueId}/resolution` | Operations | Record an authorized resolution. |
| `GET /api/v1/operations/summary` | Operations | Return only agreed operational counts. |

Decision, resolution, search, retention, audit-log, and dashboard fields are intentionally unspecified until operator needs and access policy are agreed. Operations actions should record actor, timestamp, and reason in an audit trail once audit requirements are decided.

## Validation and behavioral rules for implementation

- Validate every request on the server; frontend validation is for usability only.
- Derive ownership and capabilities from the verified token and server-controlled records.
- Apply state transitions through service functions so customer, runner, and operations actions share one rule set.
- Use an idempotency key for request creation to reduce duplicate submissions on retries; key format, retention, and conflict response need an implementation decision.
- Acceptance must be concurrency-safe.
- Return only caller-authorized fields. Define a field-level projection for customers, unassigned runners, assigned runners, and operations before connecting real participant data.
- Never treat the frontend’s displayed fee or customer estimate as an approved quote.
- Avoid logging exact addresses, phone numbers, tokens, passwords, or handoff notes by default.

## Policy-dependent decisions: unresolved

No values below are set by this API proposal. Product/operations must decide them before they are enforced in production:

1. Pilot geography, campus/service boundary, operating hours, and request volume limits.
2. Allowed categories, prohibited items/tasks, item size/weight limits, and whether purchases are allowed.
3. User identity and verification requirements for the pilot, if any.
4. Runner application fields, reviewer roles, approval/denial outcomes, reapplication rules, and availability requirements.
5. Required customer profile fields, phone collection/verification, and customer identity requirements.
6. Fee components, fee ranges, minimum/maximum, currency, rounding, tax treatment, item-cost handling, express charges, cancellation charges, runner compensation/share, and when a quote is binding.
7. Whether a quote is shown before request submission, whether a request can be posted while fee policy is unconfigured, and how estimates are used for research.
8. Payment methods, payment provider, authorization/capture timing, settlement cadence, refunds, failed payments, and cash handling.
9. Cancellation eligibility/cutoffs, cancellation fees, refunds, and who can cancel at each state.
10. Lifecycle semantics, runner/customer confirmation requirements, completion timing, issue states, resolution authority, and service-level expectations.
11. Number of simultaneous active assignments per runner, queue ordering, request expiry, reassignment, and runner no-show handling.
12. Which fields appear before acceptance and after assignment; privacy rules for precise addresses, contact information, location tracking, and handoff notes.
13. Issue reason codes, evidence attachments, response targets, dispute process, and resolution options.
14. Operations role provisioning, least-privilege access, searchable fields, retention, audit logging, and export/report access.
15. Data retention and deletion, account deletion behavior, privacy notices, consent, and any legal/compliance requirements for the operating location.
16. Notifications and support channels, including whether email, SMS, push, or in-app messages are part of the pilot.
17. API page size/sort defaults, rate limits, idempotency-key policy, and whether any public health endpoint is needed.

## Implementation boundary for B1–B5

B1 documented the repository and proposed the API contract. B3 added the initial Supabase schema, token verification, and self-profile routes. B4 added customer request creation, list, detail, validation, and an atomic creation history event. B5 added a restricted open queue, atomic acceptance, assigned requests, two runner lifecycle actions, issue reporting, and request event history. Courier access is available to any authenticated account. A temporary bypass opens new and existing policy-pending requests and records the release in request history; fee and settlement remain unconfigured. Operations decisions, cancellation, customer completion confirmation, issue resolution, payment, and full frontend workflow remain unimplemented.
