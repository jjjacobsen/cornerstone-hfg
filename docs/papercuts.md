# Papercuts

## 2026-09-01: Generated Cloudflare types exceed hk file-size limit

`hk fix --all` stopped because `worker-configuration.d.ts` exceeds the
`check-added-large-files` limit. The text fixers changed its generated content, and typos reported valid country
codes in its type unions. Excluding this tracked generated file from those
steps unblocked validation

The built-in gitleaks step scanned ignored `dist/` files and reported generated
Vinext prerender values as secrets. A gitleaks path allowlist for `dist/`
unblocked the secret scan

Prettier joins Markdown paragraph lines beyond markdownlint's default 80-character
limit. Disabling MD013 prevents the two required Markdown steps from conflicting

## 2026-09-02: Built Worker used a different local D1 state

Wrangler resolved local persistence relative to the generated `dist/server/wrangler.json` file. The development server had seeded data, but the built Worker failed with `no such table: groups`. Passing the same absolute project-root `--persist-to` path to migration, seed, and built Worker scripts unblocked preview validation

## 2026-09-02: Focused browser snapshots temporarily hid an existing ref

A Playwright ref from a full snapshot was unavailable immediately after a focused subtree snapshot even though the page did not change. Running `find` for the control refreshed the ref and unblocked the response update smoke test

## 2026-09-02: Cloudflare Workers rejected the seeded PBKDF2 iteration count

The password helper generated verifiers with 310,000 PBKDF2 iterations, but the production Workers Web Crypto implementation accepts no more than 100,000. Login returned HTTP 500 even though the D1 seed import succeeded. Reading the live Worker tail exposed the limit. Using 100,000 iterations in both the helper and login verifier unblocked production authentication

The first private seed password refresh left the old iteration count in the SQL row. Validation stopped the production update before it ran. A later comparison also showed that the expected verifier was not in production. Generating one verifier from the intended password, writing it to both the private seed and D1, and testing the production login response unblocked authentication
