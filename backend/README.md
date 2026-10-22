# Knights Delivery Backend

## Local setup

1. Install the supported Node.js version used by the project.
2. From `backend/`, install dependencies with `npm install`.
3. Copy `.env.example` to `.env`. Set `PORT`, `NODE_ENV`, `CORS_ORIGINS`, and `JSON_BODY_LIMIT` for your local environment. For profile routes, also set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from a non-production Supabase project. For local frontend development, use `http://localhost:5173` as an allowed origin. The server defaults to port `5000`, development mode, both local frontend origins (`5173` and `3000`), and a `100kb` JSON limit when settings are omitted.
4. Start the API using `npm run dev` or `npm start`.
5. Check `GET http://localhost:5000/api/v1/health` for a secret-free health response. `GET /` remains available for compatibility.

The API exposes health, own-profile, customer request, runner application/queue/acceptance, lifecycle, issue, and request-history endpoints. Runner applications start as `pending`; a trusted project operator must set eligibility directly in Supabase. Do not add secrets to `.env.example` or commit `.env`.

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

The initial schema is in `../supabase/migrations/`. Install the Supabase CLI, authenticate with `supabase login`, link a non-production project with `supabase link --project-ref <project-ref>`, review the pending change with `supabase db push --dry-run`, then apply it with `supabase db push`. Do not run these commands against production during development. The SQL policy tests are in `../supabase/tests/` and can be run with `supabase test db` after the local Supabase stack is available.

The API accepts a Supabase Auth access token in `Authorization: Bearer <token>`. Sign-up and sign-in remain in the Supabase Auth client. Profile endpoints are `GET /api/v1/profile` and `PATCH /api/v1/profile`; updates accept `displayName` and `phone` only. The backend verifies the token with Supabase Auth and performs profile reads/writes with the same user token so database row policies remain in force.

Runner applications currently collect no evidence because the required application fields and review workflow are unresolved. `POST /api/v1/runner/application` creates a pending application; `GET` reads the caller's status. Only trusted database operators can change `runner_applications.status` to `eligible` or `ineligible`; there is no public eligibility-grant or operations route. Eligibility is checked by the API and database functions for queue, assignment, acceptance, lifecycle, and assigned-runner history access.

For a non-production pilot only, after verifying an applicant through the agreed process, an authorized Supabase project operator may change that applicant's status from `pending` to `eligible` in `public.runner_applications`. Do not grant eligibility based only on an API request.

The runner queue returns a restricted, generic summary with no precise addresses or customer contact details. A successful acceptance is transactional with its history event, and only one runner can win. Precise fulfillment fields are available to that assigned eligible runner. Lifecycle actions are limited to `start` and `mark_delivered`; owners may report an issue while the request is accepted, in progress, or delivered. Request events are read through `GET /api/v1/requests/:requestId/events` by the customer or assigned eligible runner.

Customer requests created by B4 remain `awaiting_policy` and are not listed in the runner queue. The workflow can process `open` requests after an approved release policy makes them open; no endpoint or migration silently opens requests or creates a fee. Cancellation, customer completion confirmation, issue resolution, and operations review remain disabled until their rules are approved.
