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
