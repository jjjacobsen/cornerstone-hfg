# Cornerstone HFG

A Cloudflare Worker application for home fellowship group planning

## Local setup

1. Install the tools from `mise.toml`

   ```sh
   mise install
   ```

2. Install the existing npm dependencies

   ```sh
   npm ci
   ```

3. Apply the D1 migrations to the local database

   ```sh
   npm run db:migrate:local
   ```

4. Create `.dev.vars` with the required `SESSION_SECRET`. It must be at least 32 UTF-8 bytes. This command uses the built-in Node crypto module to generate a strong local value

   ```sh
   printf 'SESSION_SECRET=%s\n' "$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64'))")" > .dev.vars
   ```

5. Start the development server

   ```sh
   npm run dev
   ```

The all-zero D1 database ID in `wrangler.jsonc` is a valid local placeholder. Replace it before a production deployment

The local migration, seed, and built Worker scripts all use `.wrangler/state` in the project root. This keeps local D1 data consistent when Wrangler runs with the generated `dist/server/wrangler.json` configuration. The built Worker also reads the required secret from the root `.dev.vars` file

## Private local seed

Store private seed data in `.private/seed.sql`. Git ignores all files in `.private/`

Apply the seed only after you apply the local migrations

```sh
npm run db:seed:local
```

Use SQL inserts in the seed file. Do not put names, addresses, passwords, or other personal data in tracked files

Generate password fields without an extra package

```sh
read -s PASSWORD
printf '\n'
printf '%s' "$PASSWORD" | npm run password:hash
unset PASSWORD
```

The helper writes a random hexadecimal salt, a PBKDF2-SHA-256 hash, and the iteration count. Copy these values into the private seed SQL

## Production D1 setup

1. Sign in to Cloudflare with Wrangler

   ```sh
   npx wrangler login
   ```

2. Create the production database

   ```sh
   npx wrangler d1 create cornerstone-hfg
   ```

3. Replace the placeholder `database_id` in `wrangler.jsonc` with the ID from Wrangler

4. Apply production migrations

   ```sh
   npm run db:migrate:remote
   ```

5. Store the required production session secret with Wrangler. Enter a strong value of at least 32 UTF-8 bytes when prompted

   ```sh
   npx wrangler secret put SESSION_SECRET
   ```

6. Build and deploy the Worker

   ```sh
   npm run build
   npm run deploy
   ```

The build removes `dist/server/.dev.vars` after Vinext finishes so local secrets do not remain in generated artifacts

Do not run the private local seed command against production. Manage production data through an approved private process

## npm scripts

- `npm run build` builds the Worker output and removes its copied `.dev.vars` file
- `npm run cf-typegen` generates Cloudflare binding types
- `npm run deploy` deploys the built Worker
- `npm run dev` starts the Vinext development server
- `npm run preview` builds and starts the Worker locally
- `npm run start` starts the built Worker with Wrangler, root `.dev.vars`, and root local D1 state
- `npm run db:migrate:local` applies pending migrations to the root local D1 state
- `npm run db:migrate:remote` applies pending migrations to production D1
- `npm run db:seed:local` executes `.private/seed.sql` against the root local D1 state
- `npm run password:hash` reads a password from standard input and returns seed values

You can run each npm script through mise with `mise x -- npm run <script>`
