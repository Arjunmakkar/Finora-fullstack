# FINORA Security Rules (Personal Finance Data: Treat All of it as Sensitive)

## Money and Data Model
- Store all monetary values as integer paise (already the rule). Reject non-integer, NaN, negative (unless it's a valid refund type), or absurdly large amounts on the server.
- Every table holding user financial data has a `userId` column. Every Prisma query on that data must filter by the authenticated user's ID. Never take `userId` from the request body or query string.
- Transfers, budget updates, and any multi-row change run in a `prisma.$transaction`.
- Don't hard-delete financial records unless the feature requires it. Prefer soft delete or an audit trail.
- Never store bank login credentials. If a feature would need them, stop and ask me first.

## Authentication
- Hash passwords with argon2 or bcrypt. Never store, log, or return them.
- Put session tokens in httpOnly, Secure, SameSite=Strict cookies. Never store tokens in localStorage, sessionStorage, or Zustand persist middleware.
- Keep auth state in Zustand, but only non-sensitive fields like "is logged in" and the user's display name. The token stays in the cookie.
- Rate-limit `/login`, `/signup`, and any password-reset route (express-rate-limit or similar). Use a generic error message so attackers can't tell which emails exist.
- Expire sessions after a set idle time. Provide a logout that clears the server-side session.

## Authorization (Highest Priority)
- Check ownership on every read, update, and delete by ID. A test should confirm that user A gets 404 (not 403, so existence isn't leaked) when requesting user B's account, transaction, or budget.
- Add a middleware that requires authentication by default. Routes are public only if listed explicitly.
- Never expose Prisma models directly. Map to explicit response DTOs so internal fields don't leak.

## Database (SQLite + Prisma)
- The `.db` file lives outside the web root and is never committed, zipped, or served. Add `*.db`, `*.db-journal`, and `prisma/*.db` to `.gitignore`.
- Use Prisma's typed API. Don't use `$queryRawUnsafe`. If you use `$queryRaw`, use tagged template literals with parameters.
- Seed data must be fictional. Never copy real transactions, account numbers, or names into seeds, fixtures, or screenshots.
- Encrypt sensitive text fields (account numbers, notes, merchant details if they're personal) with AES-256-GCM before storing. The key comes from an env var, never from the code, and is not in the repo.
- Store only the last 4 digits of any account or card number. Never store the full number.

## Ask Finora and LLM Providers
- Treat transaction descriptions, notes, and any user-entered text as untrusted. They can contain prompt-injection attempts. Don't let model output trigger actions (transfers, deletes, updates) without a separate, explicit server-side check and user confirmation.
- Send the LLM the minimum needed to answer: aggregated figures, categories, and time ranges, not raw transaction lists or account identifiers. Strip names and account numbers before the prompt is built.
- Provider API keys are server-side only. Never expose them to the frontend or include them in the zip.
- Don't log full prompts or model responses, since they contain financial data. Log only the request ID, latency, and error type.
- Render model output as plain text. Don't use `dangerouslySetInnerHTML` or a markdown renderer without sanitization.
- Keep the rule-based fallback working so the app never depends on an external provider for core features.

## Web Hardening
- Use helmet for security headers and a Content Security Policy. Keep `unsafe-inline` out of the CSP.
- CORS: explicit origin allowlist with credentials. Never `*` with credentials.
- If cookie auth is used, add CSRF protection (SameSite plus a CSRF token on state-changing requests).
- Express error handler returns generic messages. Never send stack traces, SQL errors, or Prisma error details to the client.
- Validate all request bodies with zod schemas at the route boundary.

## Logging and Privacy
- Don't log amounts together with user IDs, names, merchants, or account data.
- Don't put financial values in URLs (they end up in server and proxy logs).
- Add a data export and a full account deletion endpoint. Deletion must remove all of the user's rows.

## Dependencies and Delivery
- Commit `package-lock.json`. Run `npm audit` after changes and report high or critical findings.
- Before creating the deliverable zip, make sure it contains no `.env`, `node_modules`, `*.db`, logs, or real data. Include only `.env.example` with placeholder values.
- Don't add a package without saying why.

## Behavior Rules
- Never disable or weaken a security check to make an error go away. Fix the cause or ask me.
- Any new feature touching accounts, transactions, or LLM input needs a short threat model in your summary: what data it touches, who can access it, and what could go wrong.
- List the security implications of every new endpoint, auth change, or data-model change in your summary.
- Write authorization tests for every new resource endpoint (user A cannot access user B's data).
