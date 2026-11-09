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
- App-wide Chinese/Spanish language system:
  - The shared selector is available in the main navigation on every route.
  - First visits use the browser language (Spanish browsers use Spanish;
    other languages use Chinese); an explicit choice is saved in
    `localStorage` and restored on refresh.
  - Language changes update the page language and metadata without a reload or
    resetting customer form values. Customer and admin copy remains organized
    by feature; shared language state and homepage/tool translations live in
    `app/language.tsx`.
- Homepage redesigned as a responsive Barcelona-focused real estate platform,
  with navigation, BUY/RENT calls to action, service and process sections,
  platform benefits, and an API-backed property showcase. Only properties
  returned by the public API are shown; property images are used only when the
  API supplies a safe image reference, and demo properties retain a clear
  `DEMO` label.
- Customer and administrator pages now use the shared language preference and
  global navigation; their API request/response and authentication behavior is
  unchanged.
- Existing property valuation, regional comparison, rental-risk, and
  geography tools remain connected to their documented endpoints and are
  available from the redesigned homepage. Their static interface copy follows
  the selected language; backend-generated content and property/location data
  are not automatically translated.

## Configuration and limitations

- Set `NEXT_PUBLIC_API_BASE_URL` to the backend origin in the deployment
  environment. Do not put backend administrator credentials or signing secrets
  in frontend environment variables.
- The backend currently returns no available properties from
  `GET /api/properties?transaction_type=RENT` (HTTP 200, empty list). The UI
  displays that empty state rather than inventing listings.
- Requests from the local development origin to the deployed backend were
  blocked by its CORS policy during browser verification. Local inventory and
  geography therefore showed their error states; production-origin CORS could
  not be checked from this workspace.
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
- Browser-checked Chinese/Spanish switching on the homepage, customer form,
  analysis tools, and admin login; browser-language detection, saved preference
  after refresh, customer form value preservation, and document language/title
  updates all behaved as expected.
- Checked the admin and customer views at a 390px mobile viewport with no
  horizontal overflow; the mobile navigation opens and remains usable.
- No application page exceptions or React key warnings were observed after
  fixing the translation tree. Local browser requests to the deployed API
  produced the CORS limitation noted above.
- Browser-tested the customer workflow against a temporary local mock using
  the documented schemas: property listing → requirement submission → matches
  → viewing request.
- Browser-tested the administrator workflow against the same temporary local
  mock: login → leads → lead status update → agent assignment → lead matches →
  viewing list/status update.
- The mock data was local test-only data and explicitly labeled `DEMO`; no
  fake listings or test customer records were added to the application or
  deployed backend.
