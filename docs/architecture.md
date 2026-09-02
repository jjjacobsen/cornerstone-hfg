# Architecture

## Runtime

The application runs as a Cloudflare Worker built by Vinext. Wrangler serves the built Worker and deploys it to Cloudflare

The `DB` binding gives Worker code access to Cloudflare D1. `wrangler.jsonc` is the source configuration. Vinext uses it when it creates the deployment configuration. The binding uses the Cloudflare-assigned `database_id` in production and a stable all-zero `preview_database_id` in local development

The Vite Cloudflare plugin stores state in `.wrangler/state`. Local migration, seed, and built Worker scripts pass `--persist-to "$INIT_CWD/.wrangler/state"`. This makes the development server and each command use the same D1 state in the project root, including commands that use `dist/server/wrangler.json`

Vinext can copy `.dev.vars` into `dist/server`. The build script removes that copy after a successful build so local secrets do not remain in generated artifacts. The built Worker start script passes the root `.dev.vars` file to Wrangler explicitly

## Data model

The initial migration creates four tables

- `groups` stores the public group identity, password verifier fields, and IANA timezone
- `households` belongs to one group. A household name is unique in its group
- `meetings` belongs to one group and can refer to a host household
- `responses` joins one meeting to one household. Its composite primary key permits one response per household and meeting

Foreign keys remove child households and meetings when a group is removed. They also remove responses when their meeting or household is removed. If a host household is removed, the meeting remains and its host becomes null

Meeting dates use the `YYYY-MM-DD` text format. Response status is one of `yes`, `no`, or `maybe`. Response update times use UTC ISO 8601 text

Indexes support group household lists, group meeting calendars, host lookups, and household response lists

## Migrations

Wrangler reads ordered SQL files from `migrations/`. It records applied migrations in each D1 database

Use `npm run db:migrate:local` for local development. Use `npm run db:migrate:remote` only after the production database ID is in `wrangler.jsonc`

Do not change a migration after another environment applies it. Add a new numbered migration for each schema change

## Authentication

Each group has one shared password verifier. The password helper uses Node PBKDF2 with SHA-256, a random 16-byte salt, a 32-byte hash, and 100,000 iterations. This is the maximum iteration count supported by the Cloudflare Workers Web Crypto implementation. The database stores all three verifier values. It does not store the password

A login for an unknown group still performs one 100,000-iteration PBKDF2 derivation against dummy verifier data before it fails. This reduces group discovery through response timing

The login and logout endpoint accepts POST requests only when the `Origin` header matches the request origin. Successful login creates an HTTP-only, same-site session cookie. `SESSION_SECRET` signs the cookie with HMAC-SHA-256 and is required to contain at least 32 UTF-8 bytes before HMAC use

Generate a strong local `SESSION_SECRET` in `.dev.vars` as shown in `README.md`. Store the production value with `wrangler secret put SESSION_SECRET`

## Private data

Tracked files contain no group or household data. Local private seed SQL belongs in `.private/seed.sql`, which Git ignores

`.dev.vars` is also ignored. `.dev.vars.example` labels `SESSION_SECRET` as required without storing a secret value
