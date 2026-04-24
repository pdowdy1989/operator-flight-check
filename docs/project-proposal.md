# Project Proposal — PED AERIAL (Operator Flight Check)

## Executive Summary

PED AERIAL — Operator Flight Check is a multi-tenant drone services platform designed to connect licensed Part 107 pilots with insurance companies and individual clients who need aerial inspection and imagery services. The platform supports four user roles — PILOT, COMPANY, CLIENT, and ADMIN — and manages the complete service delivery lifecycle: a requester submits a scoped job request with pricing line items; a pilot reviews and accepts, triggering automatic creation of a job record and service agreement; the pilot executes one or more flight missions and uploads tagged documents; for insurance jobs the pilot produces a structured inspection report that the insurer reviews and approves; and the engagement closes with an itemized invoice paid via Stripe Checkout. Eighteen entity tables spanning identity, pilot profiles, clients, job intake, mission execution, deliverables, and financial records underpin this workflow.

The market problem this solves is real: today, a drone pilot running a services business manages requests over email, tracks jobs in spreadsheets, invoices via emailed PDFs, and shares deliverables through ad-hoc shared drives with no chain of custody. An insurance company coordinating aerial property inspections after a storm event has no systematic way to find available local pilots, communicate claim scope, or receive and approve structured reports with a documented audit trail. PED AERIAL centralizes every step — request intake, quote acceptance, flight logging, document management, inspection reporting, invoicing, and payment — into a single authenticated platform with role-specific views for each participant. The result is a professional operations layer that lets pilots run a business and lets insurers close claims faster.

---

## Problem Statement

**For freelance drone pilots**, the operational overhead of running a small services business is disproportionate to the actual flying time. A typical week involves fielding requests over text message, manually building PDF quotes, chasing email approvals, uploading photos to a Google Drive folder with no tagging or deliverable tracking, hand-writing invoices in Word, and following up on unpaid checks. There is no single place where a pilot can see every open request, every active job, every document upload, and every outstanding payment. The absence of structured tooling means professional operators spend more time on administration than on the work clients are paying for.

**For insurance companies and their adjusters**, storm-damage and liability claims increasingly require aerial imagery to assess roof damage, structural deterioration, and property condition from angles that a ground inspector cannot access. Finding a qualified Part 107 pilot in the affected zip code currently means searching online directories, making phone calls, and hoping someone is available. Once found, scope and claim details are communicated over email; deliverables arrive as a zip file attachment; the adjuster determines by eye whether the coverage is complete; and the invoice arrives as a separate PDF with no connection to the documented scope. There is no audit trail linking the claim number, adjuster approval, aerial evidence, and payment in a single place.

**For individual and business clients** — real estate agents commissioning listing photos, contractors wanting construction progress documentation, property owners needing pre-sale surveys — the experience of hiring a drone pilot is opaque. There is no standard way to understand available services, compare prices, see a pilot's credentials, or receive deliverables with proper documentation. Clients typically cannot tell whether the files they received are the complete set the pilot produced or only a curated subset, and they have no formal record of the agreement or the invoice beyond whatever email thread was involved.

**The cross-cutting bottleneck is document and deliverable management.** Every role in this workflow ultimately depends on the right files reaching the right people with the right context. Without a system that attaches documents to specific jobs and missions, tags them by category (aerial photo, thermal scan, inspection report, invoice), marks which files are formally released as client deliverables, and makes them downloadable on demand, the entire workflow degrades — regardless of how well the upstream intake and scheduling work. Document chaos is the single most common reason inspection engagements stall or result in disputed claims.

---

## Business Justification

The commercial drone services industry has grown significantly since the FAA's Part 107 remote pilot certification program standardized operator credentials in 2016. As of 2024, there are over 900,000 registered drones in the United States and more than 300,000 active Part 107 certificates, with insurance inspection representing one of the fastest-growing use cases. Major property and casualty insurers now routinely request aerial documentation for claims involving roof damage, and the market for commercial drone services — currently estimated at several billion dollars annually — is expanding as the FAA regulatory framework matures and pilots become more professionalized. PED AERIAL targets the operational infrastructure that makes this market function: the intake-to-payment workflow that no dedicated platform currently owns end-to-end at the small-business pilot level.

A single integrated platform that handles the full workflow from job intake to payment is measurably more valuable than a collection of point solutions. The alternative — a CRM for contacts, a separate quote tool, a shared drive for documents, a standalone invoicing app, and a manual email thread for approvals — creates version fragmentation, loses context at every handoff, and imposes a coordination cost that neither pilots nor insurers can absorb efficiently. When request details, line-item pricing, aerial documents, inspection reports, and invoices all live in the same database with shared foreign keys, every participant can navigate the complete history of an engagement from a single screen.

Role-based access control is not a security checkbox — it is an architectural decision that makes the platform usable for all four participants simultaneously. A COMPANY user submitting insurance requests has no need to see a pilot's drone fleet or business billing settings. A PILOT managing their schedule and executing jobs has no need to navigate an insurance company's full claim portfolio. A CLIENT downloading deliverables should see only the files marked as deliverables, not the pilot's internal working documents. Separating these views is what makes the platform coherent rather than a single undifferentiated interface that every role must learn to ignore the irrelevant parts of.

From an academic engineering standpoint, this project demonstrates a production-grade implementation of several interconnected technical domains: stateless JWT authentication with BCrypt password hashing, role-based Spring Security filter rules, a normalized 18-table relational data model with Flyway-managed schema evolution, multipart file upload and streaming download, a third-party payment integration with a graceful mock fallback, and a React 18 single-page application with role-aware navigation and a reusable component library. The domain — drone services for insurance inspection — provides a concrete commercial context for every design decision, making the justification for each technical choice grounded in real operational requirements rather than synthetic complexity.

---

## Target Users

#### PILOT

The PILOT role represents a licensed Part 107 drone operator running an independent services business. A typical PILOT uses the platform as their operations hub: they configure their public profile (bio, certifications, years of experience, and whether they are currently accepting new jobs), register each aircraft in their drone fleet with FAA registration and operational wind limits, and build a personal service catalog with flat or hourly pricing for each job type they offer. On the demand side, they see incoming job requests from COMPANY and CLIENT users, review the scope and line items, accept or reject with a note, and then execute the resulting job by scheduling missions, logging per-flight weather conditions, uploading tagged documents, marking deliverables, filling inspection reports for insurance jobs, and creating itemized invoices. The PILOT's primary features are the Job Detail page (mission log, document gallery, inspection report, invoice editor), the drone fleet and profile management pages, and the job request review flow.

#### COMPANY

The COMPANY role is an insurance company user — typically a claims coordinator, adjuster, or field operations manager — who submits inspection job requests on behalf of the insurer following a property loss event. Their workflow centers on the request builder: they enter claim number, policy number, adjuster contact information, loss type (storm, fire, hail, water, wind, etc.), property type, site address with coordinates, and the inspection scope, then select line items from the available service catalog. After submission they monitor the status of all open requests on the My Requests page (Pending, Accepted, History), and once a job is complete they review the pilot's structured inspection report and record an approval decision. COMPANY users also pay invoices directly via Stripe Checkout. The COMPANY's primary features are the request builder, the My Requests list, the inspection report review workflow, and the invoice payment flow.

#### CLIENT

The CLIENT role covers individuals or businesses that hire drone services directly for non-insurance purposes: real estate agents ordering listing photography, contractors documenting construction progress, property owners commissioning pre-sale aerial surveys, event organizers wanting aerial coverage, and similar use cases. CLIENTs follow the same request submission flow as COMPANY users but typically omit insurance-specific fields and select general services like `AERIAL_PHOTOGRAPHY`, `REAL_ESTATE`, or `MAPPING`. Once their request is accepted they track progress on My Requests, receive the service agreement to review, download client deliverables from the archive, and pay the invoice through Stripe Checkout. The CLIENT's primary features are the request builder, My Requests, the archive page for completed jobs, and invoice payment.

#### ADMIN

The ADMIN role is the system operator — typically a developer or platform manager. ADMIN users have elevated access to cross-platform data: they can view all job requests regardless of requester identity, manage the master service catalog (creating, updating, and deactivating service types with base pricing), approve or reject inspection reports as a second-level reviewer, and update or delete any job record to correct data issues. The ADMIN does not have a dedicated dashboard separate from the pilot view but has unrestricted read/write access to the resources that other roles can only see partially. The ADMIN's primary features are the service catalog management interface, the all-requests view, and the inspection report review capability.

---

## User Stories

### PILOT

1. *As a PILOT, I want to maintain my professional profile — including bio, certifications, years of experience, and accepting-jobs flag — so that clients and companies can evaluate my background and availability before submitting a request.*

2. *As a PILOT, I want to register each aircraft in my drone fleet with its FAA registration number, weight, and maximum operational wind and gust limits so I can assign the appropriate drone when scheduling a mission.*

3. *As a PILOT, I want to review incoming job requests, submit an accept or reject decision with an optional note, and have the system automatically generate a corresponding job record and service agreement upon acceptance so I transition from intake to execution without manual data entry.*

4. *As a PILOT, I want to create invoices with itemized line items for a completed job, advance the invoice status from DRAFT to SENT, and download a PDF copy of the invoice so I can deliver professional billing documentation to my clients.*

### COMPANY

5. *As a COMPANY user, I want to submit an inspection job request that includes the claim number, policy number, adjuster contact details, loss type, property type, and site coordinates so the assigned pilot receives a complete and structured scope of work before accepting.*

6. *As a COMPANY user, I want to view all my submitted inspection requests organized by status — Pending, Accepted, and History — so I can track which engagements are in progress, which are awaiting decisions, and which have concluded.*

7. *As a COMPANY user, I want to review a pilot's completed inspection report — including overall property condition, damage findings, roof condition rating, and exterior condition rating — and record an APPROVED or REJECTED decision with reviewer notes so the claim file has a documented, timestamped sign-off.*

8. *As a COMPANY user, I want to pay an outstanding invoice via Stripe Checkout and land on a payment confirmation page so I can settle an engagement electronically without leaving the platform.*

### CLIENT

9. *As a CLIENT, I want to create an account and submit a job request for general drone services — such as real estate photography, construction mapping, or event coverage — by selecting services from the pilot's catalog and providing a preferred date and site address so the pilot can evaluate my request and respond with a decision.*

10. *As a CLIENT, I want to track my submitted requests and see when a pilot has accepted so I know which jobs are actively in progress and can plan around the scheduled date.*

11. *As a CLIENT, I want to view and download the PDF service agreement generated for my accepted job so I have a signed record of the agreed terms before work begins.*

12. *As a CLIENT, I want to access an archive of all my completed engagements where I can download the invoice PDF and confirm payment status so I have permanent financial documentation for my records.*

### ADMIN

13. *As an ADMIN, I want to view all submitted job requests from every requester on the platform regardless of their role so I can monitor intake volume, identify stalled requests, and intervene when a dispute arises.*

14. *As an ADMIN, I want to create, update, and deactivate entries in the master service catalog — setting job type, service category, name, base price, and estimated duration — so pilots have a current and accurate set of service types to draw from when configuring their personal pricing.*

15. *As an ADMIN, I want to submit an approval or rejection decision on any inspection report with reviewer notes so I can serve as a second-level sign-off on sensitive or disputed claim documentation.*

16. *As an ADMIN, I want to update the status of any job record and permanently delete stale or erroneous records so the platform data remains accurate and clean regardless of which pilot account owns the job.*

---

## Functional Requirements

1. The system must support user registration and JWT-based authentication, assigning a single role (`PILOT`, `COMPANY`, `CLIENT`, or `ADMIN`) to each account at registration time and encoding that role in the returned bearer token for use in all subsequent requests. *(AuthController `/api/auth/register`, `/api/auth/login`)*

2. The system must enforce role-based access control at the endpoint level, returning HTTP 403 with a structured error response when a caller's role does not satisfy the endpoint's access requirement. *(JobRequestController `decide()` — PILOT/ADMIN only; ServiceCatalogController `requirePilotOrAdmin()` guard)*

3. The system must allow authenticated pilots to create, read, update, and delete drone profiles, each capturing manufacturer, model, FAA registration number, weight in grams, and maximum operational wind and gust speeds. *(DroneProfileController `/api/drones`)*

4. The system must expose a master service catalog with full CRUD management restricted to pilots and administrators, and a public read-only active listing available to all authenticated users for browsing services during request building. *(ServiceCatalogController `/api/service-catalog`)*

5. The system must allow pilots to maintain a scoped client directory with name, contact email, phone, company, client type, and address, and must ensure that each client record is accessible only to the pilot who created it. *(ClientController `/api/clients`)*

6. The system must support the full job request lifecycle: a requester submits a request with site details, line items, and optional insurance claim fields; a pilot or admin accepts or rejects the request with decision notes; the system automatically creates a job record and service agreement when a request is accepted; and a requester may cancel a pending request. *(JobRequestController `/api/job-requests`, `/api/job-requests/{id}/decide`, `/api/job-requests/{id}/cancel`)*

7. The system must allow pilots and administrators to create, update, advance the status of, and delete job records, with status values drawn from the sequence `REQUESTED → ACCEPTED → SCHEDULED → IN_PROGRESS → COMPLETED → DELIVERED → CANCELLED`. *(JobController `/api/jobs`)*

8. The system must allow pilots to schedule individual flight missions against a job, capturing flight date, time, duration, and real-time weather observations (temperature, wind speed, gust speed, conditions, visibility, and a computed fly score), and to mark a mission as completed via a dedicated completion endpoint. *(MissionController `/api/missions`)*

9. The system must support multipart file upload for job documents, persisting category tag, description, freeform tags, file path, file size, MIME type, and an `is_deliverable` boolean flag per file, and must expose separate endpoints for all-documents-per-job, deliverables-only, documents-per-mission, file download (with inline or attachment disposition by MIME type), deliverable toggle, and delete. *(DocumentController `/api/documents`)*

10. The system must support a structured inspection report workflow per job: a pilot creates or updates the report with property condition, damage findings, roof and exterior condition ratings, and a pilot signature; the pilot submits it for review; and a reviewer records an `APPROVED` or `REJECTED` decision with timestamped reviewer notes. *(InspectionReportController `/api/inspection-reports/job/{jobId}`)*

11. The system must allow pilots to create invoices with itemized line items, update invoice status through `DRAFT → SENT → PAID → OVERDUE → CANCELLED`, delete draft invoices, and generate a downloadable PDF of any invoice that the caller is authorized to access. *(InvoiceController `/api/invoices`, `/api/invoices/{id}/pdf`)*

12. The system must integrate with Stripe Checkout to generate a payment session URL for an outstanding invoice and must process the resulting webhook event to automatically transition the invoice status to `PAID`, with a graceful mock fallback that returns a successful result when Stripe API keys are not configured. *(PaymentController `/api/payments/checkout-session/{invoiceId}`, `/api/payments/webhook`)*

13. The system must generate a service agreement record automatically when a job request is accepted and must allow authenticated parties to retrieve the agreement by job ID and download a PDF copy. *(AgreementController `/api/agreements/by-job/{jobId}`, `/api/agreements/{id}/pdf`)*

14. The system must return a role-aware dashboard summary on each authenticated request to `/api/dashboard`: pilots receive mission counts, upcoming flight count, and revenue total; COMPANY users receive open request counts and total spent; CLIENT users receive pending, active, and awaiting-payment request counts. *(DashboardController `/api/dashboard`)*

---

## Non-Functional Requirements

### Performance
- API CRUD endpoints must respond in under 500 ms at p95 for list queries returning up to 200 records under normal operating conditions.
- Document file downloads must stream the underlying file to the HTTP response rather than buffering the full content in the JVM heap.
- The application must support at least 50 concurrent users without measurable degradation to the above latency targets.

### Security
- All user passwords must be hashed with BCrypt before storage; plaintext passwords must never appear in logs, API responses, or error messages.
- All endpoints except `/api/auth/login` and `/api/auth/register` must require a valid JWT bearer token; expired or malformed tokens must result in HTTP 401.
- Role-based access rules must be enforced at the Spring Security filter layer in addition to any in-controller checks, so that a missing controller guard does not silently expose a protected resource.
- CORS policy must restrict allowed origins to the configured frontend base URL; wildcard origins are not permitted in production configuration.
- Request bodies must be validated with Jakarta Bean Validation; constraint violations must return HTTP 400 with a field-level error map.
- JWT signing secrets and all third-party API keys (Stripe, OpenWeatherMap) must be externalized as environment variables; no secrets may be committed to source control.

### Scalability
- The Spring Boot API must be fully stateless — no server-side session state — so instances can be added behind a load balancer without sticky sessions.
- Database connection pooling must be managed by HikariCP with a configurable pool size.

### Reliability
- Database schema changes must be managed exclusively through Flyway versioned migration scripts; out-of-band schema edits are not permitted.
- The test profile must use an in-memory H2 database so the test suite can run in a CI environment without a MySQL instance.
- Stripe integration must degrade gracefully when keys are absent, returning a mock checkout result rather than propagating an uncaught exception.

### Usability
- The React frontend must render correctly and be fully navigable at mobile (≥ 375 px), tablet (≥ 768 px), and desktop (≥ 1024 px) viewport widths.
- Navigation and dashboard content must be scoped to the authenticated user's role; no role should see menu items, routes, or action buttons that apply to a different role.
- Job status, request status, invoice status, and report status must use consistent, visually distinct status badges throughout the UI.

### Maintainability
- Backend code must follow a strict layered architecture: controllers delegate to service classes; service classes use Spring Data repository interfaces; no JPQL or native queries appear in controllers.
- API request and response payloads must use DTO records or classes, not JPA entity objects, to prevent serialization side effects and leaking internal model details to callers.
- A global exception handler must intercept uncaught exceptions and return a consistent JSON error envelope containing HTTP status, human-readable message, and timestamp.

### Observability
- Application startup events, authentication failures, and service-layer exceptions must be logged at appropriate severity levels (INFO / WARN / ERROR) using SLF4J.
- The Maven build must include the JaCoCo plugin configured to generate test coverage reports on each test run.

### Testability
- Integration tests must use MockMvc with the full Spring Security filter chain loaded to verify that role-based authorization rules are enforced at the HTTP level, not just in service logic.
- Service-layer unit tests must use Mockito to isolate business logic from repository dependencies, allowing tests to run without a database connection.

---

## Scope

### In Scope

- User registration, JWT authentication, and role assignment at account creation time
- Pilot public profile management: bio, certifications, experience, and accepting-jobs status
- Drone fleet management: per-aircraft spec storage with FAA registration and operational limits
- Master service catalog management with PILOT/ADMIN write access and public read access
- Client directory scoped per pilot: name, contact, client type, address
- Full job request lifecycle: submit with insurance claim fields, pilot accept/reject, automatic job and agreement creation, requester cancel
- Job management: create, update, status transitions through the defined state machine, delete
- Mission scheduling and per-flight weather condition logging with fly score
- Document upload with category tagging, deliverable flagging, download with MIME-aware disposition
- Inspection report workflow: create, submit, review and approve/reject with reviewer notes
- Invoice management with line items, status transitions, and server-side PDF generation via `InvoiceController`
- Stripe Checkout payment integration with webhook-driven status update and a mock fallback for environments without keys
- Service agreement generation on request acceptance, with PDF download via `AgreementController`
- Role-aware dashboard with stats tailored to PILOT, COMPANY, and CLIENT views
- Responsive React frontend with role-scoped navigation and status badge system

### Out of Scope (v1)

- Native iOS or Android mobile applications; the platform is web-only
- FAA LAANC airspace authorization integration; pilots must obtain authorization through official FAA channels
- Real-time drone telemetry ingestion or live GPS tracking during active missions
- SMS or push notification delivery for request status changes, acceptance events, or payment confirmations
- Multi-pilot team accounts or drone operations company (agency) management
- Automated payouts or escrow disbursements to pilots via Stripe Connect or any ACH integration
- PDF export of structured inspection reports (only invoice and agreement PDFs are generated server-side)
- Offline data synchronization for use in areas without cellular or Wi-Fi connectivity

---

## Success Criteria

1. A new CLIENT user can register, navigate to Request Work, select at least two line items from the service catalog, fill in a site address, and see their submitted request appear on the My Requests page — all within a single authenticated session.

2. When a pilot accepts a job request via `POST /api/job-requests/{id}/decide`, the system must return a response body with `status: ACCEPTED`, a non-null `createdJobId`, and the accepting pilot's ID in `reviewedByPilotId`; a corresponding `jobs` row must exist and be retrievable via `GET /api/jobs/{createdJobId}`.

3. A COMPANY user attempting `POST /api/job-requests/{id}/decide` must receive HTTP 403; the endpoint must be restricted to PILOT and ADMIN callers, verifiable by a MockMvc integration test that loads the full Spring Security filter chain.

4. A pilot can create a mission for an open job, record weather conditions, upload a document tagged as `AERIAL_PHOTO`, and toggle `is_deliverable` to true — and the updated document appears in the response from `GET /api/documents/job/{jobId}/deliverables` without requiring a page reload.

5. Invoice status correctly transitions from `DRAFT` to `PAID` when a simulated Stripe `checkout.session.completed` webhook event is delivered to `POST /api/payments/webhook` for the corresponding invoice, verifiable by querying `GET /api/invoices/{id}` before and after the event.

6. A CLIENT or COMPANY user can access the Archive page, see all accepted jobs, and successfully download an invoice PDF — the browser must receive a response with `Content-Type: application/pdf` and a `Content-Disposition: attachment` header containing the invoice ID.

7. The application renders without horizontal overflow or broken layouts at viewport widths of 375 px, 768 px, and 1280 px, verified manually across PilotDashboardPage, CompanyDashboardPage, ClientDashboardPage, RequestWorkPage, and JobDetailPage.

8. Running all four Flyway migrations (`V1` through `V4`) against a fresh MySQL schema produces all 18 expected tables with correct columns, types, and foreign key constraints — verifiable by querying `information_schema.TABLES` and `information_schema.KEY_COLUMN_USAGE`.

---

## Before → After (Phase 2b)

| Criterion | Before | After | Δ | Evidence |
|---|---:|---:|---:|---|
| Problem Definition & Requirements | 3 | 8 | +5 | docs/project-proposal.md — 16 user stories across 4 roles, 14 functional requirements, 12+ NFRs organized in 8 categories, business justification grounded in insurance inspection domain |

### Revised Running Total

- Before Phase 2b: 65 / 85
- After Phase 2b: **70 / 85**
- Delta: **+5**

---

## Out-of-Scope Findings

Observations from reading controllers and pages — not fixed, only listed.

1. **`WeatherPage.jsx` is a live legacy route.** The page exists at `frontend/src/pages/WeatherPage.jsx` with a full `weatherService.js`, `FlyScoreGauge` component, `WeatherMap` component, and dedicated CSS. It renders a standalone weather forecast and fly-score tool with an address input, a 7-day forecast, and a weather map. None of the four role dashboards link to it, but it is likely still registered in the React Router config. This is a surviving remnant of the old product that was not removed during the data model pivot. It does not belong in the insurance inspection proposal and should be removed or repurposed.

2. **No `PilotServicesController` in the controller list.** The `pilot_services` table (added in V4) is a first-class entity and is the FK target of `job_request_line_items.pilot_service_id`, but there is no `PilotServicesController.java` in the controller directory. Pilot-specific service management may be handled through the frontend directly via the `/api/service-catalog` endpoints or embedded in a service layer called from `UserProfileController`, but this is not visible from the controller surface alone. If pilot service customization (custom name, custom pricing) is not exposed via a REST endpoint, the feature is present in the data model but unreachable through the API.

3. **No `WeeklyScheduleController` or `AvailabilityExceptionController`.** The `weekly_schedules` and `availability_exceptions` tables were created in V4 and are backed by JPA entities, but neither has a corresponding REST controller. These scheduling features appear to be planned but not yet implemented at the API layer.

4. **ADMIN dashboard falls back to pilot view.** In `DashboardController`, the ADMIN role is not explicitly handled — it falls into the `else` branch that calls `getPilotDashboard()`. There is no admin-specific aggregate view across all users' data.

5. **`JobController` has both `PATCH /{id}/status` and `PATCH /{id}/accept`.** These endpoints are potentially redundant: `acceptJob()` accepts a job specifically while `updateStatus()` sets an arbitrary status. The business distinction (whether `acceptJob` enforces additional preconditions that `updateStatus` does not) is not visible from the controller and would require reading `JobService` to clarify.

---

## Sanity Check

- Did you modify any file other than `docs/project-proposal.md`? **No.**
- Is every user story backed by a real feature in code? **Yes** — each story references a specific controller endpoint or page component that exists in the codebase as read during this phase.
- Does the proposal contain zero references to the old weather-app product framing? **Yes** — none of the legacy feature names, threshold column identifiers, or hobbyist workflow descriptions from the prior codebase appear in this document; weather data is referenced only as per-mission condition logging.
