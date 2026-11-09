# BCN Housing frontend status

## Implemented

- Centralized typed API access in `lib/api.ts`, configured by
  `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`). The default points to the
  existing deployed backend; production deployments should set the variable to
  their backend origin without an `/api` suffix.
- Customer experience at `/customer`:
  - BUY/RENT requirements, locations, budget, property type, bedrooms, area,
    timeline, additional requirements, contact methods, and preferred language.
  - Client validation and API error/loading/success states.
  - Fetches only available backend properties and requirement matches.
  - Shows backend match scores and explanations, states that scores are not a
    guarantee, and labels every `DEMO` property.
  - Submits viewing requests for returned matches.
  - Chinese and Spanish interface options. The flow does not imply customer
    accounts or ownership validation; requirement IDs should be kept private.
- Administrator workspace at `/admin`:
  - Authenticates through `/api/admin/login`; stores the bearer token in
    tab-scoped `sessionStorage`, attaches it only to admin requests, clears it
    on logout or `401`, and requests private data only after login.
  - Shows leads and requirements, lead matches, agents, properties, and viewing
    requests.
  - Updates lead status, assigns agents, manages agent active/verified state
    and property availability, and updates viewing status/agent assignment.
  - Chinese and Spanish interface options.
- Existing valuation, regional comparison, rental-risk, and geography tools
  remain connected to their documented endpoints and retain the existing
  visual design.

## Configuration and limitations

- Set `NEXT_PUBLIC_API_BASE_URL` to the backend origin in the deployment
  environment. Do not put backend administrator credentials or signing secrets
  in frontend environment variables.
- The backend currently returns no available properties from
  `GET /api/properties?transaction_type=RENT` (HTTP 200, empty list). The UI
  displays that empty state rather than inventing listings.
- No disposable backend or administrator credentials were supplied. Live
  requirement/viewing writes and live admin authentication were therefore not
  attempted. The documented API also does not verify ownership of public
  requirement IDs; this frontend does not present the customer flow as an
  authenticated account.
- The legacy comparison and rental-risk endpoints depend on their configured
  external analysis service; their behavior remains subject to backend
  availability and the contract's prototype/legal-advice limitations.

## Validation

- `npx tsc --noEmit` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; routes `/`, `/customer`, and `/admin` build as
  static pages.
- Browser-tested the customer workflow against a temporary local mock using
  the documented schemas: property listing → requirement submission → matches
  → viewing request.
- Browser-tested the administrator workflow against the same temporary local
  mock: login → leads → lead status update → agent assignment → lead matches →
  viewing list/status update.
- The mock data was local test-only data and explicitly labeled `DEMO`; no
  fake listings or test customer records were added to the application or
  deployed backend.
