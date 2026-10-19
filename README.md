# PayPulse Copilot

PayPulse Copilot is a human-approved PayPal dispute-operations workspace for small teams. It turns a verified PayPal Sandbox case into an explainable evidence review, a dependency-aware financial command center, and a non-secret audit trail.

## Why it exists

Dispute response is fragmented across payment records, invoices, shipment tracking, deadlines and downstream vendor obligations. PayPulse brings those signals into one workspace while keeping consequential actions behind explicit human approval.

## Working prototype

- Verified PayPal Sandbox card transaction and buyer-created dispute snapshot.
- Real AG Grid Community command center with sorting, filtering, pagination and pinned identifiers.
- Real local AI inference using Hugging Face Transformers.js and `Xenova/mobilebert-uncased-mnli`.
- Zero-shot evidence classification for missing tracking, weak explanations, transaction mismatch and strong fulfillment evidence.
- Evidence staging with required fields, length bounds and explicit approval.
- Owner authentication on every server-side PayPal or evidence-staging route.
- Audit metadata that excludes access tokens, credentials and private account details.
- No live payments, automatic refunds, automatic evidence submission or adjudication.

## PayPal Sandbox proof

The demo uses transaction `9WU41528W79857207` and case `PP-R-QCQ-10193553`, created on October 19, 2026. The case was verified as `UNDER REVIEW`. Identifiers are Sandbox-only and move no real money.

The current PayPal REST app can obtain OAuth tokens but PayPal blocks buyer impersonation with `No permissions to set target_client_id`. The prototype therefore demonstrates the officially supported buyer Resolution Center flow and keeps the API-created buyer-dispute route owner-only until buyer-side consent is enabled. This limitation is shown rather than hidden.

## Architecture

1. PayPal Sandbox supplies the payment and dispute lifecycle.
2. AG Grid renders dispute, invoice and dependency records.
3. Transformers.js downloads and caches an ONNX model in the browser, then analyzes evidence text locally.
4. A Cloudflare Worker serves the app and guards server actions using ChatGPT Sites identity headers.
5. The policy layer rejects evidence preparation unless every required field and a scoped human approval are present.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npm test
npm run build
npm run validate
```

Serve the generated `dist` artifact with a Cloudflare Worker-compatible runtime, or deploy through ChatGPT Sites. The browser must reach jsDelivr and Hugging Face Hub for AG Grid and the first model download.

## Optional PayPal API seeder

Never commit credentials. Configure these values only as runtime secrets:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_BUYER_PAYER_ID`
- `PAYPAL_BUYER_TRANSACTION_ID`

Run:

```bash
PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... PAYPAL_BUYER_PAYER_ID=... npm run seed:sandbox -- --buyer-transaction-id=...
```

Buyer-side PayPal consent is required for API-created buyer disputes. Without it, use the PayPal Sandbox Resolution Center and keep the seeder disabled.

## Safety and privacy

- Sandbox only.
- No real-money movement.
- No autonomous evidence submission.
- No autonomous dispute acceptance, escalation or adjudication.
- No secrets in browser code, logs, repository or screenshots.
- Local AI inference keeps the evidence narrative in the browser.
- Model confidence is advisory and never treated as a decision.

## Tests

The Node test suite verifies browser-script parseability, approval enforcement, required evidence fields and bounded notes.

## License

Apache-2.0. See [LICENSE](LICENSE).
