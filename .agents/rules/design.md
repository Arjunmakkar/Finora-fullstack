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
