# Knights Delivery Backend

## Local setup

1. Install the supported Node.js version used by the project.
2. From `backend/`, install dependencies with `npm install`.
3. Copy `.env.example` to `.env`. Set `PORT`, `NODE_ENV`, `CORS_ORIGINS`, and `JSON_BODY_LIMIT` for your local environment. For profile routes, also set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from a non-production Supabase project. For local frontend development, use `http://localhost:5173` as an allowed origin. The server defaults to port `5000`, development mode, both local frontend origins (`5173` and `3000`), and a `100kb` JSON limit when settings are omitted.
4. Start the API using `npm run dev` or `npm start`.
5. Check `GET http://localhost:5000/api/v1/health` for a secret-free health response. `GET /` remains available for compatibility.

The API exposes health, own-profile, customer request, runner queue/acceptance, lifecycle, issue, and request-history endpoints. Any authenticated account may use courier features; assignment and request ownership remain enforced by the API and database policies. Do not add secrets to `.env.example` or commit `.env`.

## Environment variables

| Name | Purpose | Default |
|---|---|---|
| `PORT` | HTTP listen port, integer from 1 through 65535. | `5000` |
| `NODE_ENV` | Runtime mode: `development`, `test`, or `production`. | `development` |
| `CORS_ORIGINS` | Comma-separated explicit HTTP(S) origins. | `http://localhost:5173,http://localhost:3000` |
| `JSON_BODY_LIMIT` | Express JSON parser size limit, such as `100kb` or `1mb`. | `100kb` |
| `SUPABASE_URL` | Supabase project URL used by Auth and the PostgREST API. | Not configured |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used with the user's access token. Never use a secret/service-role key here. | Not configured |

`MONGO_URI` is legacy and unused. The B3 profile API uses the configured Supabase project with the caller's access token; it does not use a service-role key.

## Commands

- `npm start` — start the server.
- `npm run dev` — start with nodemon.
- `npm test` — run backend API tests using Node's built-in test runner.

## Supabase schema

The schema is in `../supabase/migrations/`. Install the Supabase CLI, authenticate with `supabase login`, link the intended project with `supabase link --project-ref <project-ref>`, review the pending change with `supabase db push --dry-run --remote`, then apply it with `supabase db push --remote`. Migration `20261024000000_remove_runner_eligibility.sql` removes the courier eligibility gate and API application flow while retaining existing application records as inaccessible legacy data. Do not apply migrations to a production project until you have reviewed the dry run. The SQL policy tests are in `../supabase/tests/` and can be run with `supabase test db` after the local Supabase stack is available.

The API accepts a Supabase Auth access token in `Authorization: Bearer <token>`. Sign-up and sign-in remain in the Supabase Auth client. Profile endpoints are `GET /api/v1/profile` and `PATCH /api/v1/profile`; updates accept `displayName` and `phone` only. The backend verifies the token with Supabase Auth and performs profile reads/writes with the same user token so database row policies remain in force.

Courier access is available to any authenticated account; there is no runner application or eligibility review route. The runner queue returns a restricted, generic summary with no precise addresses or customer contact details. A successful acceptance is transactional with its history event, and only one runner can win. Precise fulfillment fields are available only to the assigned runner. Lifecycle actions are limited to `start` and `mark_delivered`; request owners may report an issue while the request is accepted, in progress, or delivered. Request events are read through `GET /api/v1/requests/:requestId/events` by the customer or assigned runner.

Temporary launch bypass: customer requests are created as `open` and appear in the runner queue. The migration also opens existing `awaiting_policy` requests and records that transition. This does not create a payable quote, courier payout, or settlement flow; the customer estimate is not authoritative. Remove the bypass after the fee and settlement policies are approved. Cancellation, customer completion confirmation, issue resolution, and operations review remain disabled until their rules are approved.
