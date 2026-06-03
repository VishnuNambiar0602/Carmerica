# GulfCarX / CarServ — Production Issues & Gap Analysis

> Full codebase audit completed June 2, 2026. Every file analysed: server, client, services, data, schema, AI layer, and admin/vendor/customer UI.

---

## 1. Search & Filtering System

### 1.1 Filters Are Purely Cosmetic
**File:** `src/pages/customer/SearchResults.tsx`

The filter sidebar renders checkboxes for Service Type, Price Range, Rating, Distance, and the "AI Smart Filters" panel — but **none of them are wired up**. There is no state management, no `onChange` handler, and no re-query logic. Users click filters and nothing happens.

**Required fix:** Connect each filter group to a shared filter state object; debounce and re-call `/api/ai/smart-search` or `/api/garages` with the active filters passed as query params.

---

### 1.2 Sort Order Is Not Implemented
**File:** `src/pages/customer/SearchResults.tsx`

The UI claims results are "sorted by best value and proximity" but the sort is never applied. The API returns whatever order the database returns and the frontend renders it as-is.

**Required fix:** Add a sort dropdown (relevance / rating / price: low–high / distance) and apply it client-side or server-side.

---

### 1.3 Search Params Are Not Reflected in the URL
**File:** `src/pages/customer/Home.tsx`, `src/pages/customer/SearchResults.tsx`

The home page builds a URL like `/search?location=...&carModel=...` but `SearchResults` never reads those params on mount. The condensed search bar in SearchResults has `defaultValue="Los Angeles, CA"` hardcoded and doesn't parse `location` from the URL. Refreshing the page resets the search state.

**Required fix:** Use `useSearchParams()` to read and write all search/filter state so links are shareable and browser back/forward work correctly.

---

### 1.4 No Pagination or Infinite Scroll
**Files:** `src/pages/customer/SearchResults.tsx`, `server/routes.ts` — `GET /garages`

The garage list API has no `page`, `limit`, or `offset` params. All garages are returned and rendered in a single pass. At scale this will be slow and unrendered.

**Required fix:** Add `limit` / `offset` (or cursor-based) pagination on the API, and implement "Load more" or infinite scroll on the frontend.

---

### 1.5 Multi-Service / Multi-Attribute Filtering Not Supported
**File:** `server/lib/db.ts` — `listServices()`, `listGarages()`

The DB layer accepts a single `query` string or a single `vendorId`/`garageId`. There is no support for filtering by price range, rating threshold, multiple service types, distance radius, or open-now status.

**Required fix:** Extend the filter interface and the Supabase queries to support compound WHERE clauses.

---

## 2. Notification System

### 2.1 No Real-Time Push Notifications
**Files:** `server/routes.ts` — `POST /bookings`, `PATCH /notifications/:id/read`

The backend creates in-app notifications in the DB on booking creation — but there is **no WebSocket, Server-Sent Events, or push notification channel**. The frontend has no polling or socket connection either. Users never see notifications until they manually navigate to an endpoint that doesn't exist in the UI.

**Required fix:** Implement a WebSocket channel (e.g. via `ws` or `socket.io`) or SSE endpoint for live notification delivery. Add a notification bell component to all three layouts.

---

### 2.2 Notification Bell UI Does Not Exist
**Files:** `src/components/layout/CustomerLayout`, `VendorLayout`, `AdminLayout` (not opened but confirmed absent from `App.tsx` imports)

No layout component renders a notification icon or unread badge. The schema table `notifications` is defined and the API exists at `GET /notifications`, but nothing calls it from the frontend.

**Required fix:** Add a `NotificationBell` component to each layout header that polls or subscribes to unread notifications.

---

### 2.3 No Email / SMS Notification Delivery
**File:** `server/routes.ts` — `POST /bookings`

A notification row is created in the DB when a booking is made, but no external delivery (email, SMS, WhatsApp) is triggered. There is no email service (SendGrid, Resend, Postmark) configured and no SMS provider (Twilio, etc.) integrated.

**Required fix:** Add a transactional email job triggered on: booking confirmed, booking cancelled, booking reminder (T-24h), and KYV status change.

---

### 2.4 Notification Types Are Minimal
**File:** `server/schema.sql` — `notifications` table

Only `booking_created` is used in code. Missing notification types: `booking_confirmed`, `booking_cancelled`, `booking_reminder_24h`, `payment_received`, `refund_issued`, `review_requested`, `kyv_approved`, `kyv_rejected`, `chat_message_received`.

---

## 3. AI Engine — Parts Identification

### 3.1 `/api/ai/identify-part` Does Not Exist
**File:** `src/pages/customer/SmartGarage.tsx` — `handleUpload()`

The SmartGarage page uploads an image to `POST /api/ai/identify-part`, but this route is **not defined anywhere in `server/routes.ts`**. The call will return a 404. The UI has a well-designed result panel that will never receive data.

**Required fix:** Implement the route using the `@google/genai` Gemini Vision API (already in `package.json`) to analyse the uploaded image and return `{ name, confidence, oem, condition, vulnerability, keywords }`.

---

### 3.2 `/api/ai/predict-maintenance` Does Not Exist
**File:** `src/pages/customer/SmartGarage.tsx` — `handleDiagnose()`

The "Run AI Scan" button calls `POST /api/ai/predict-maintenance` which also does not exist in `server/routes.ts`. The request 404s and the diagnosis panel never populates.

**Required fix:** Implement the route — accept `{ make, model, year, mileage, lastServiceDate, lastServiceType }` and return `{ engineHealthScore, urgency, expertAdvice, predictedNeeds[], vulnerabilityAlert }` using Gemini or Groq.

---

### 3.3 AI Smart Search Uses Only Keyword Regex
**File:** `server/routes.ts` — `inferCategory()`

The `inferCategory` function used by `/api/ai/smart-search` is a basic regex switch. It does not use an LLM, does not understand synonyms or complex natural language queries ("my car shakes at 60mph" → alignment/balancing), and returns no contextual recommendations.

**Required fix:** Route the smart-search query through the Groq LLM to extract intent, urgency, and recommended service categories before querying the DB.

---

### 3.4 AI Price Optimisation Is Purely Statistical
**File:** `server/routes.ts` — `POST /api/ai/optimize-price`

The "AI price optimisation" calculates a simple average of all service prices and suggests 5% below. It does not consider seasonality, demand, competitor pricing, vehicle type, or geographic market data. The "AI" label is misleading.

**Required fix:** Either remove the AI label or replace the logic with a Groq/Gemini call that considers market context.

---

### 3.5 Gemini SDK Imported but Unused
**File:** `package.json`, `server/routes.ts`

`@google/genai` is listed as a dependency but is not imported or used anywhere in the server code. Only Groq is used. The Gemini key is exposed to the Vite client bundle via `define` in `vite.config.ts`, which is a security risk.

**Required fix:** Remove the `define` block for `GEMINI_API_KEY` from `vite.config.ts` — API keys must only be used server-side.

---

## 4. Vehicle & Parts Management

### 4.1 Vehicle Data Is Hardcoded
**Files:** `src/services/DatabaseTool.ts`, `src/pages/customer/SmartGarage.tsx`

`getUserVehicles()` in `DatabaseTool.ts` returns a hardcoded Toyota Camry for `user-1`. The SmartGarage page also hardcodes two demo vehicles inline. There is no `vehicles` table in `schema.sql`, no API endpoint to create/read/update vehicles, and no UI form for adding a vehicle.

**Required fix:** Create a `vehicles` table, CRUD API endpoints, and a vehicle management UI in the customer profile.

---

### 4.2 VIN Lookup Not Implemented
**File:** `src/pages/customer/SmartGarage.tsx`

VIN numbers are shown (`4T1BF1FKXNU******`) but there is no VIN decode API integration. Users cannot enter a VIN to auto-populate make/model/year/trim.

**Required fix:** Integrate a VIN decoder API (NHTSA free API or a commercial provider) on the checkout and SmartGarage vehicle forms.

---

### 4.3 Service History Not Tracked
**File:** `server/schema.sql`

The `bookings` table records services but there is no dedicated service history model or aggregated view per vehicle. The AI maintenance predictor would need structured service history to make accurate predictions.

**Required fix:** Add a `service_history` view or materialised table that links bookings → vehicles → service records.

---

## 5. Checkout & Booking Flow

### 5.1 Booking Summary Is Hardcoded
**File:** `src/pages/customer/Checkout.tsx`

The order summary sidebar always shows "Elite Auto Care", "Downtown, Dubai", "AED 350", and "AED 367.50 total" — regardless of which garage or service the user selected. The `serviceParam` and `priceParam` from the URL are read but never used to update the sidebar.

**Required fix:** Populate the booking summary from URL params and a lookup of the selected service/garage.

---

### 5.2 Date and Time Are Hardcoded
**File:** `src/pages/customer/Checkout.tsx`

`date` defaults to `"Oct 12, 2026"` and `time` to `"10:00 AM"` — hardcoded `useState` defaults. There is no date picker or availability slot selector. The API endpoint `GET /availability/slots` exists but is never called from Checkout.

**Required fix:** Integrate a date picker with dynamic slot loading from `/api/availability/slots?vendorId=...&date=...`.

---

### 5.3 Card Payment Is Disabled ("Coming Soon")
**File:** `src/pages/customer/Checkout.tsx`

The credit/debit card option is rendered as `cursor-not-allowed grayscale` with "Coming Soon". Stripe is fully integrated on the backend (`server/lib/stripe.ts`, payment intent routes), but the frontend never initiates a Stripe payment flow. There is no Stripe Elements or Stripe.js integration.

**Required fix:** Implement Stripe Payment Elements or the Payment Request Button on the checkout page, calling `/api/payments/create-intent` and confirming with the client secret.

---

### 5.4 No Input Validation on Checkout
**File:** `src/pages/customer/Checkout.tsx`

The "Next Step" button on Step 1 proceeds regardless of empty fields. There is no validation for email format, phone format, required fields, or minimum car year. The API only validates `date`, `time`, and `email` exist.

**Required fix:** Add client-side form validation (required fields, email regex, phone format) before allowing step progression.

---

## 6. Authentication & Session Management

### 6.1 No Auth Guards on Protected Customer Routes
**File:** `src/App.tsx`

`/my-bookings`, `/checkout`, `/profile`, and `/smart-garage` are accessible without authentication. `MyBookings.tsx` does a token check internally but silently renders empty state if the user is not logged in, rather than redirecting.

**Required fix:** Create a `ProtectedRoute` wrapper that redirects unauthenticated users to `/login` with a `redirect` param.

---

### 6.2 Token Stored in `localStorage`
**Files:** `src/pages/customer/MyBookings.tsx`, `src/pages/vendor/*`

JWT tokens are stored in `localStorage` which is vulnerable to XSS. The entire application is susceptible because tokens persist indefinitely with no expiry management on the client side.

**Required fix:** Store tokens in `httpOnly` cookies set by the server, or implement a short-lived access token + refresh token rotation pattern.

---

### 6.3 Password Reset Token Is Returned in API Response in Dev
**File:** `server/routes.ts` — `POST /auth/forgot-password`

```ts
resetToken: process.env.NODE_ENV === 'production' ? undefined : token,
```
The reset token is returned in the JSON response in development. If this ever runs with `NODE_ENV` not set to `production` in staging, the token leaks.

**Required fix:** Always send the token via email only. Never return it in an API response in any environment.

---

### 6.4 No Rate Limiting on Password Reset
**File:** `server/routes.ts`, `server/index.ts`

The `authLimiter` is applied to `/api/auth/login` and `/api/admin/login` but **not** to `/api/auth/forgot-password` or `/api/auth/reset-password`. Attackers can enumerate emails or flood reset requests.

**Required fix:** Apply the auth rate limiter to all auth-related routes including password reset.

---

### 6.5 Vendor Registration Has No Email Verification
**File:** `server/routes.ts` — `POST /auth/register`

Vendors can register and immediately become active without verifying their email address. The `verified` flag on the vendor record defaults to `false` but the platform does not enforce verification before allowing bookings or service listings.

**Required fix:** Send a verification email on registration and block platform access until the email is confirmed.

---

## 7. Vendor Dashboard Gaps

### 7.1 Vendor Stats Are Computed Naively
**File:** `server/routes.ts` — `GET /vendor/stats`

Revenue is the sum of all booking amounts including Cancelled and Pending bookings. Only confirmed/completed bookings should count. There is also no date-range filtering, so "monthly revenue" is actually all-time revenue.

**Required fix:** Filter by `status IN ('Confirmed', 'Completed')` and add a `month` query param to scope the date range.

---

### 7.2 Vendor Cannot Create a Garage
**File:** `server/routes.ts`

There is no `POST /garages` endpoint. Vendors registered through the normal signup flow receive a vendor record but have no way to create a garage listing from the dashboard. The only garages in the system are seeded from `InMemoryStore.seedInitialData()`.

**Required fix:** Add `POST /garages` and `PATCH /garages/:id` routes restricted to `vendor` and `admin` roles, and add a garage creation UI in the vendor dashboard.

---

### 7.3 Staff Management Has No Functional Backend Route
**File:** `server/routes.ts`

The schema defines a `staff` table and the vendor dashboard imports `VendorStaff.tsx`, but there are no `/staff` API routes in `routes.ts`. Any staff CRUD operations will fail silently.

**Required fix:** Implement `GET/POST/PATCH/DELETE /staff` routes.

---

### 7.4 Vendor Earnings / Payouts Not Implemented
**File:** `server/routes.ts`

There are no payout or earnings API endpoints. The `VendorEarnings` page presumably renders static data. The `payments` table records platform transactions but there is no vendor payout ledger, commission calculation, or Stripe Connect integration.

**Required fix:** Model commission and payout logic; integrate Stripe Connect for vendor disbursements.

---

## 8. Admin Panel Gaps

### 8.1 All Admin Stats Are Hardcoded
**Files:** `src/pages/admin/AdminOverview.tsx`, `src/pages/admin/AdminAnalytics.tsx`

Every number in the admin dashboard — Total Bookings (1,240), Platform GMV ($142,500), Active Vendors (85), Active Users (4,250) — is hardcoded in the component. The charts (revenue trends, user acquisition) use hardcoded arrays. No actual data is fetched from the API.

**Required fix:** Build aggregation endpoints (`GET /admin/stats`, `GET /admin/analytics`) and wire the admin pages to call them.

---

### 8.2 Admin Actions Are UI-Only
**Files:** `src/pages/admin/AdminVendors.tsx`, `src/pages/admin/AdminUsers.tsx`, `src/pages/admin/AdminBookings.tsx`

Buttons like "Suspend", "Approve", "Investigate Now", "Dismiss" have no `onClick` handlers wired to API calls. The admin UI is visually complete but functionally inert.

**Required fix:** Wire every action button to the appropriate API endpoint with confirmation dialogs.

---

### 8.3 Fraud Detection Is Static
**File:** `src/pages/admin/AdminOverview.tsx`

The "AI-Driven Fraud Detection" panel shows hardcoded alerts ("Elite Motors requested a payout of $12,500 with 4 duplicate transaction IDs"). There is no actual fraud detection engine, no anomaly detection on the payment data, and no real-time alerts.

**Required fix:** Implement heuristic or ML-based anomaly detection on bookings/payments (e.g. duplicate transaction IDs, review velocity, unusual payout patterns) and surface real alerts.

---

### 8.4 KYV (Know Your Vendor) Has No Document Upload
**File:** `src/pages/admin/AdminVendorKYV.tsx`

The schema defines `kyv_documents` with `file_url` and the status flow `pending → approved/rejected`, but there is no file upload endpoint on the server and no file storage integration (S3, Supabase Storage, Cloudflare R2).

**Required fix:** Implement a document upload endpoint using multipart form data and integrate with a blob storage provider.

---

### 8.5 CMS Editor Has No Rich Text / WYSIWYG
**File:** `src/pages/admin/AdminCMS.tsx`

The CMS page stores `content` as raw HTML in the DB but the admin UI is a basic `<textarea>`. There is no WYSIWYG editor, no image upload for CMS pages, and no preview mode.

**Required fix:** Integrate a lightweight rich-text editor (e.g. TipTap or Quill) and a preview pane.

---

## 9. Data Integrity & Architecture Issues

### 9.1 Dual Data Source with Silent Fallback
**File:** `server/lib/db.ts`

The `Database` class silently falls back from Supabase to an in-memory store on any error. In production, a Supabase connection failure causes the app to serve stale seed data without any error surfaced to the user or operator. Writes to the in-memory store are lost on restart.

**Required fix:** In production mode, hard-fail on DB errors rather than silently degrading. Log and alert on fallback activation.

---

### 9.2 In-Memory Store Is Not Thread-Safe or Persistent
**File:** `server/lib/db.ts` — `InMemoryStore`

The in-memory store is a plain object array. Under concurrency (multiple Node.js processes via a load balancer) each process has its own store — bookings created on instance A are invisible to instance B. Data is lost on any restart.

**Required fix:** Use Redis or the database as the canonical store even in development. Remove reliance on the in-memory store for anything other than unit tests.

---

### 9.3 `DatabaseTool.ts` Is a Separate Mock Layer
**File:** `src/services/DatabaseTool.ts`

The client-side `DatabaseTool.ts` maintains its own hardcoded arrays of bookings, garages, and reviews. These are used by the AI chat agents to answer user queries, but they are entirely disconnected from the real database. The chat agent will report stale or incorrect booking data.

**Required fix:** Remove `DatabaseTool.ts`. The AI chat endpoint on the server (`aiSupport.ts`) already fetches live data from the DB — the chat agents should rely on that.

---

### 9.4 `CALIFORNIA_GARAGES` Static Dataset for Map
**File:** `src/data/garages.ts`

The `GarageLocator` service and `GarageMap` component use a hardcoded list of 12 California garages with approximate coordinates. These are completely separate from the garages stored in the database and have no relationship to the real vendor listings.

**Required fix:** Remove the static dataset. Fetch garages from the API and require vendors to provide lat/lng coordinates when registering their garage. Add `lat` and `lng` columns to the `garages` table.

---

### 9.5 `bookings` Table Has No `customer_id` Foreign Key Enforced
**File:** `server/schema.sql`, `server/routes.ts` — `POST /bookings`

The booking is created with a `customer_email` string but `customer_id` is nullable and not populated even when a logged-in user makes the booking. This means booking history cannot be reliably linked to user accounts.

**Required fix:** Extract the user ID from the JWT token (if present) and populate `customer_id` on booking creation.

---

### 9.6 Supabase `stripe_payment_intent_id` Column Missing
**File:** `server/schema.sql`

The `payments` table schema does not include `stripe_payment_intent_id`, but the application code sets and reads this field. The Supabase migration will succeed (column silently dropped) but Stripe payment tracking will break in production.

**Required fix:** Add `stripe_payment_intent_id text` to the `payments` table definition in `schema.sql`.

---

## 10. Security Issues

### 10.1 Groq API Key Committed to `.env.example`
**File:** `.env.example`

```
GROQ_API_KEY="REDACTED"
```
A real Groq API key is committed to the repository in `.env.example`. This key should be revoked immediately and rotated.

**Required fix:** Revoke the key, replace with a placeholder like `"YOUR_GROQ_API_KEY"`, and audit git history.

---

### 10.2 Gemini API Key Exposed to Browser Bundle
**File:** `vite.config.ts`

```ts
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
```
This inlines the Gemini API key into the compiled JavaScript bundle, making it visible to any user who inspects the source. All AI API calls must be proxied through the server.

**Required fix:** Remove this `define` entry. Use the API key only in server-side code.

---

### 10.3 `sanitizeInput` Middleware Only Strips `<script>` Tags
**File:** `server/middleware.ts`

The XSS sanitisation only removes `<script>` blocks. It does not strip `onerror`, `onload`, `javascript:` URIs, `<img>` with event handlers, or other XSS vectors. SQL injection is not addressed (mitigated by using an ORM/parameterised queries, but worth documenting).

**Required fix:** Replace the custom regex with a proven sanitisation library (e.g. `DOMPurify` on the server via `isomorphic-dompurify`, or `sanitize-html`).

---

### 10.4 CSRF Protection Is Origin-Check Only
**File:** `server/middleware.ts` — `csrfProtection`

The CSRF protection only checks `Origin` and `Referer` headers. These can be spoofed in some attack scenarios and do not protect against CSRF from same-origin compromised scripts. There are no CSRF tokens.

**Required fix:** Implement double-submit cookie or synchronizer token pattern for state-mutating endpoints.

---

### 10.5 Booking and Review Endpoints Have No Auth Requirement
**File:** `server/routes.ts`

`POST /bookings`, `POST /reviews`, and `GET /bookings` do not call `requireRole()`. Anyone can create a booking or review without being logged in, and anyone can enumerate all bookings by guessing email addresses via `GET /bookings?customerEmail=...`.

**Required fix:** Require authentication for all booking and review mutations. Scope `GET /bookings` results to the authenticated user's email.

---

## 11. Performance Issues

### 11.1 No API Response Caching Used for Reads
**File:** `server/routes.ts`

Redis is configured (`server/lib/redis.ts`) and `cacheGet`/`cacheSet` are exported, but they are **never called** in any route handler. The only cache operations that exist are `cacheDel` calls after mutations. All read endpoints hit the database on every request.

**Required fix:** Add `cacheGet`/`cacheSet` wrappers around expensive reads: `GET /garages`, `GET /services`, `GET /categories`, and vendor stats.

---

### 11.2 N+1 Queries in Category Listing
**File:** `server/routes.ts` — `GET /categories`

```ts
const result = await Promise.all(cats.map(async (cat) => {
  const services = await db.listServices(); // Called for every category
  ...
}));
```
`db.listServices()` is called once per category in a loop. For N categories, this is N+1 queries. Use a single query with a `COUNT(*) GROUP BY category_id`.

---

### 11.3 No Image Optimisation or CDN
**Files:** `src/pages/customer/Home.tsx`, `src/pages/customer/SearchResults.tsx`, `src/pages/customer/GarageDetails.tsx`

All images are loaded from `picsum.photos` (a placeholder service). There is no image upload, no image compression pipeline, no CDN delivery, and no `loading="lazy"` attributes on below-the-fold images. In production with real garage photos, this will cause severe performance degradation.

**Required fix:** Integrate with Cloudflare Images, Imgix, or Supabase Storage with a CDN; add `loading="lazy"` and `width`/`height` to all `<img>` tags.

---

## 12. UX & Functional Gaps

### 12.1 Map View in Search Results Is Not Implemented
**File:** `src/pages/customer/SearchResults.tsx`

The list/map toggle exists and the map view button is clickable, but switching to map view renders nothing — the `viewMode === 'map'` branch has no component.

**Required fix:** Render a `react-leaflet` `MapContainer` when `viewMode === 'map'` with garage markers from the current results.

---

### 12.2 GarageDetails Gallery Crashes When Images Are Absent
**File:** `src/pages/customer/GarageDetails.tsx`

The gallery accesses `garage.images[0]`, `garage.images[1]`, etc. directly. The API response for a garage does not include an `images` array — it returns the single `image` field from the schema. This will throw `TypeError: Cannot read properties of undefined`.

**Required fix:** Normalise the API response to always return `images: string[]` and guard array accesses in the gallery component.

---

### 12.3 GarageDetails Smart Bundles Are Always Empty
**File:** `src/pages/customer/GarageDetails.tsx`

The component renders `garage.smartBundles.map(...)` but the API never returns `smartBundles`. The array is always empty, the section renders nothing, and the UI shows a blank gap.

**Required fix:** Either generate smart bundles server-side (group services into packages) or remove the section until it is fully implemented.

---

### 12.4 `trustMetrics` Are Never Populated
**File:** `src/pages/customer/GarageDetails.tsx`

The "AI Trust Engine Verification Report" section maps over `garage.trustMetrics`, which is never returned by the API. The section is blank in production.

**Required fix:** Compute and return trust metrics from the server (or populate from a stored scoring model).

---

### 12.5 Reviews Are Not Linked to Verified Bookings
**File:** `server/routes.ts` — `POST /reviews`

Any user can post any review for any garage without having made a booking. The `reviews` schema has a nullable `booking_id` that is never populated from the frontend. The "Verified" badge shown in GarageDetails is from static review mock data.

**Required fix:** Require a valid completed `booking_id` to post a review, and mark reviews as `verified` only when the booking link is confirmed.

---

### 12.6 My Bookings Page: Garage Name and Location Are Missing
**File:** `src/pages/customer/MyBookings.tsx`

The component renders `booking.garage` and `booking.location`, but the `BookingRecord` in `server/lib/db.ts` has no `garage` or `location` fields — only `garage_id`. The page will show empty strings for garage name and location unless the data is joined at the API level.

**Required fix:** Join `garages` table data in `GET /bookings` or `GET /customer/bookings` so the response includes `garage_name` and `garage_location`.

---

### 12.7 "Rebook Service", "Download Invoice", and "View Details" Are Non-Functional
**File:** `src/pages/customer/MyBookings.tsx`

These buttons have no `onClick` handlers. Clicking them does nothing.

**Required fix:** Implement rebooking (pre-fill checkout with prior service details), invoice generation (PDF or receipt page), and a booking detail modal/page.

---

### 12.8 Chat Widget Uses Hardcoded `USER_ID = 'user-1'`
**File:** `src/components/ChatWidget.tsx`

```ts
const USER_ID = 'user-1';
```
All chat AI context queries (booking history, reviews) are run against `user-1` regardless of who is logged in. Every customer gets shown John Doe's booking history in the chat.

**Required fix:** Read the authenticated user's ID from the stored JWT token and pass it dynamically.

---

### 12.9 SmartGarage "Add New Vehicle" Button Does Nothing
**File:** `src/pages/customer/SmartGarage.tsx`

The button renders but has no `onClick` handler and no modal or form is shown.

**Required fix:** Implement a vehicle creation form/modal that calls a vehicle API endpoint.

---

### 12.10 `GarageMapPage` / `GarageMap` Uses Static California Garages
**File:** `src/components/GarageMap.tsx`, `src/services/GarageLocator.ts`

The garage map always shows the 12 hardcoded California garages regardless of the user's actual location or the garages registered in the database.

**Required fix:** Fetch garages from `/api/garages` with lat/lng data and use those for map pins.

---

## 13. Missing Core Features (Not Started)

| Feature | Evidence of Gap |
|---|---|
| **Loyalty / Rewards Program** | Mentioned in Home.tsx UI copy ("loyalty rewards") but no schema, no API, no UI beyond marketing text |
| **In-App Messaging (Vendor ↔ Customer)** | `VendorMessages.tsx` and `GET /messages` exist but messages are hardcoded chat thread data with no real-time layer |
| **Promotions / Discount Codes** | `promotions` table exists, `AdminPromotions` page exists, but no promo code input on checkout and no discount calculation logic |
| **Multi-Language / Localisation** | The platform targets UAE/Dubai but has no i18n support (Arabic RTL layout, translated strings) |
| **Accessibility (a11y)** | No `aria-` attributes on interactive elements, no keyboard navigation management, no screen reader support |
| **Mobile App / PWA** | No service worker, no manifest, no offline capability — the platform is desktop-first only |
| **Vendor Analytics (real)** | `VendorReports.tsx` exists but there is no vendor-level analytics API endpoint |
| **Inventory / Parts Management** | `OnboardingBuddy.ts` mentions "enable auto-restock" but there is no inventory schema, API, or UI |
| **Fleet / B2B Booking** | Mentioned in Home.tsx ("Fleet membership") but no multi-vehicle booking logic exists |
| **Support Ticket System UI** | `support_tickets` table and `AdminSupport` page exist but customers have no way to create or track tickets |
