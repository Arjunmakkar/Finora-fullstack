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

---

# FINORA Design Rules

## Direction
- Stark black and white. Background #0A0A0A, surface #111111, border #262626, text #F5F5F5, muted text #8A8A8A. Only one accent, #D4FF3A, used for the active nav item, primary buttons, and focus rings. Nothing else gets color.
- Don't add gradients, purple or blue glows, or blurred blobs. Those are generic.
- The 3D wireframe icosahedron is the signature element. It appears on the landing hero and the empty state of the dashboard, not on every page. Never place it behind numbers or tables.

## Type
- Display: a condensed grotesk for headings and big balance figures. Body: a neutral sans for labels and descriptions.
- All money figures use tabular-nums so columns align. Use a fixed type scale: 12, 14, 16, 20, 32, 48.
- Money formatting: Indian grouping and the ₹ symbol, for example ₹1,23,456.78. Convert paise to rupees only in the formatter, never in components.

## Dashboard
- Top row: net worth, monthly income, monthly spend, savings rate. These are the only cards that get the CSS 3D tilt effect. Keep the tilt to a maximum of 6 degrees.
- Below: spending by category (horizontal bars, not pie charts), a 6-month cash flow line, and the most recent 8 transactions.
- Show realistic density. Use real-looking fictional categories (Groceries, Rent, EMI, Subscriptions, Transport) and amounts that vary, not round placeholder numbers.
- Every chart needs a text summary for screen readers and a visible label for each value. Don't rely on color alone.

## Charts (Recharts)
- Monochrome by default: white for the primary series, grays (#8A8A8A, #4A4A4A) for others. Use dashed lines or patterns to tell series apart.
- Use the accent only for the single most important value or a budget alert.
- Remove chart junk: no 3D bars, no drop shadows, minimal gridlines (#262626), axis labels in muted text.

## Transactions
- A dense table: date, merchant, category, amount, account (last 4 digits only). Row height 40px. Right-align amounts.
- Positive and negative amounts are distinguished by sign and weight, not red and green alone. Use a minus sign (−), not a hyphen.
- No tilt effect on table rows. Hover shows a subtle surface change only.
- Empty state: one line of text and a button. No illustration.

## Ask Finora
- A chat panel with monospace-free typography, user messages right-aligned in a surface color, assistant replies left-aligned. Plain text only; no markdown rendering without sanitization.
- Show a visible label on every answer that says whether it came from the rule engine or the LLM provider.
- Suggested questions are specific to the data ("How much did I spend on food this month?") and not generic ("Ask me anything").
- Show the time range and data scope the answer used, so the user can see what was included.

## Motion (Framer Motion)
- Use motion only for: page entrance (opacity and 8px translate, 300ms), drawer open and close, the tilt cards, and the orb.
- Keep the orb's rotation slow (under 0.2 rad/s) and pause it when the tab is hidden or the user prefers reduced motion.
- Respect prefers-reduced-motion across all animations. Disable the tilt and orb rotation entirely in that mode.

## Mobile
- Under 768px, the sidebar becomes a drawer with a full-height overlay. Tilt is disabled on touch devices.
- Tables become stacked cards with the amount on the top right and the merchant on the left.
- Tap targets are at least 44px. Test the layout at 360px wide.

## States and feedback
- Every form and list has loading (skeleton in the surface color), empty, and error states.
- Errors state what went wrong and what to do next. Never show stack traces, SQL errors, or the word "Something went wrong" alone.
- Confirmations for destructive actions (delete account, delete transaction) name the item being deleted.

## Copy
- Headlines state the product value in specific terms: "See where your money goes this month," not "Welcome to FINORA."
- Button labels are verbs with objects: "Add transaction," "Export CSV," "Delete account." Not "Submit" or "OK."

## Before finishing
- Check every screen at 360px, 768px, and 1440px wide.
- Check contrast on all text. Muted text (#8A8A8A) on #0A0A0A passes AA for normal text; don't use darker grays for body copy.
- List the three design decisions that are most specific to FINORA, so I can confirm them.
