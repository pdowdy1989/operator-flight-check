# API Design -- PED AERIAL (Operator Flight Check)

The PED AERIAL API is a RESTful JSON interface over HTTP. The development base URL is `http://localhost:8081/api`. Authentication is stateless JWT via the `Authorization: Bearer <token>` header on every protected endpoint. Interactive documentation is available at `http://localhost:8081/swagger-ui.html` when the backend is running, powered by springdoc-openapi; the raw OpenAPI 3 spec is at `http://localhost:8081/v3/api-docs`.

There are 15 REST controllers grouped into 14 resource families (HealthController and AuthController share the public / no-auth surface). Access control is enforced at the URL level by Spring Security rules in `SecurityConfig.java`. The full authorization rule matrix -- including the exact Spring Security `.requestMatchers()` clauses in evaluation order -- is in `docs/architecture-diagram.md` Section 5. Controller-level `@PreAuthorize` annotations and service-layer ownership checks enforce additional fine-grained rules that URL patterns cannot express (for example, a pilot may only retrieve their own client records, not another pilot's).

---

## API Conventions

- **Base URL:** `http://localhost:8081/api` (development). In production, configure via reverse proxy; the backend reads no deployment URL property.
- **Authentication:** Send `Authorization: Bearer <jwt>` on every protected endpoint. Omitting the header on a protected endpoint returns HTTP 401.
- **Content type:** `application/json` for all request and response bodies except multipart file uploads, which use `multipart/form-data`.
- **Character encoding:** UTF-8.
- **Pagination:** Spring Data defaults apply where the underlying query returns a `Page`. Pass `?page=0&size=20&sort=field,asc` where supported.
- **UUIDs:** All `id` fields are UUID strings in standard hyphenated format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
- **Timestamps:** All `createdAt` / `updatedAt` / `decidedAt` values are ISO-8601 UTC strings (e.g., `2026-04-23T18:30:00Z`).
- **Dates:** `LocalDate` fields serialize as `YYYY-MM-DD`. `LocalTime` fields serialize as `HH:mm:ss`.
- **Status codes:**
  - `200 OK` -- successful read, update, or patch
  - `201 Created` -- successful create; `Location` header set where applicable
  - `204 No Content` -- successful delete
  - `400 Bad Request` -- validation failure (field constraint violation or missing required field)
  - `401 Unauthorized` -- missing or invalid JWT
  - `403 Forbidden` -- valid JWT but insufficient role for the requested resource
  - `404 Not Found` -- resource does not exist or caller is not authorized to see it
  - `409 Conflict` -- duplicate resource or state machine violation
  - `429 Too Many Requests` -- auth rate limit exceeded
  - `500 Internal Server Error` -- unhandled exception

**Error response envelope** (all error status codes return this shape):

```json
{
  "timestamp": "2026-04-23T18:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is required., Password must be at least 8 characters."
}
```

The `message` field for validation errors is the concatenation of all field constraint messages joined by `, `. For other errors it is a single human-readable description.

---

## Authentication and Authorization

### Token Acquisition

Call `POST /api/auth/login` with email and password. On success the response contains a `token` field which is a signed HS256 JWT.

### Token Contents

The JWT payload contains:

| Claim | Value |
|---|---|
| `sub` | User UUID (the caller's `id`) |
| `email` | User email address |
| `role` | Role string: `PILOT`, `COMPANY`, `CLIENT`, or `ADMIN` |
| `iat` | Issued-at timestamp (Unix epoch seconds) |
| `exp` | Expiration timestamp (Unix epoch seconds) |

### Token Expiry and Refresh

Tokens expire after **480 minutes (8 hours)**. There is no refresh token mechanism in the current implementation -- when a token expires the user must re-authenticate via `POST /api/auth/login`.

### Rate Limiting on Auth Endpoints

`AuthRateLimitFilter` enforces a request-rate limit on all `/api/auth/**` endpoints. Default: 10 requests per 60-second window per IP address. Both values are configurable via environment variables (`APP_SECURITY_AUTH_RATE_LIMIT_MAX_REQUESTS`, `APP_SECURITY_AUTH_RATE_LIMIT_WINDOW_SECONDS`). Exceeding the limit returns HTTP 429 with the standard error envelope.

### Role Values

| Role | Description |
|---|---|
| `PILOT` | Licensed Part 107 drone operator; manages fleet, jobs, documents, invoices |
| `COMPANY` | Insurance company user; submits inspection requests, reviews reports, pays invoices |
| `CLIENT` | Individual or business client; submits general service requests, downloads deliverables |
| `ADMIN` | Platform operator; full cross-platform read/write access |

For the full URL-level authorization rule matrix matched to SecurityConfig, see `docs/architecture-diagram.md` Section 5.

---

## Endpoint Reference

### 1. HealthController

Returns the API health status. No authentication required.

**Base path:** `/api/health`

**Access:** Public

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| GET | /api/health | Check API status | none | Health object | 200 | Public |

**Sample:**

```
GET /api/health HTTP/1.1
Host: localhost:8081
```

```json
{
  "status": "UP",
  "service": "operator-flight-check-backend",
  "timestamp": "2026-04-23T18:30:00.000Z"
}
```

---

### 2. AuthController

Handles user registration, login, and current-user introspection.

**Base path:** `/api/auth`

**Access:** Public (all endpoints). Rate-limited at 10 requests per 60 seconds per IP.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/auth/login | Authenticate and receive JWT | `AuthLoginRequest` | `AuthResponse` | 200, 400, 401, 429 | Public |
| POST | /api/auth/register | Create account and receive JWT | `AuthRegisterRequest` | `AuthResponse` | 201, 400, 409, 429 | Public |
| GET | /api/auth/me | Resolve current user from token | none | `CurrentUserResponse` | 200, 401 | Any authenticated |

**Sample -- POST /api/auth/login:**

```
POST /api/auth/login HTTP/1.1
Host: localhost:8081
Content-Type: application/json

{
  "email": "pilot@example.com",
  "password": "securepass123"
}
```

```json
{
  "id": "3f2a1b4c-...",
  "email": "pilot@example.com",
  "role": "PILOT",
  "firstName": "Jane",
  "lastName": "Doe",
  "company": null,
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Sample -- POST /api/auth/register:**

```
POST /api/auth/register HTTP/1.1
Host: localhost:8081
Content-Type: application/json

{
  "email": "company@insurer.com",
  "password": "securepass123",
  "role": "COMPANY",
  "firstName": "Alex",
  "lastName": "Smith",
  "company": "Acme Insurance"
}
```

```json
{
  "id": "7d8e9f0a-...",
  "email": "company@insurer.com",
  "role": "COMPANY",
  "firstName": "Alex",
  "lastName": "Smith",
  "company": "Acme Insurance",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### 3. UserProfileController

Read and update the authenticated user's extended profile including billing and business fields.

**Base path:** `/api/profile`

**Access:** Authenticated (catch-all rule). Each user can only read and update their own profile.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| GET | /api/profile/me | Get own profile | none | `UserProfileResponse` | 200, 401 | Any authenticated |
| PUT | /api/profile/me | Update own profile | `UserProfileUpdateRequest` | `UserProfileResponse` | 200, 400, 401 | Any authenticated |

**Sample -- GET /api/profile/me:**

```
GET /api/profile/me HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
```

```json
{
  "id": "3f2a1b4c-...",
  "email": "pilot@example.com",
  "role": "PILOT",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "555-0100",
  "company": null,
  "licenseNumber": "4234567",
  "businessName": "Doe Aerial LLC",
  "ein": "12-3456789",
  "llcVerified": true,
  "paymentTerms": "NET_30",
  "billingAddress": "123 Main St",
  "billingCity": "Irvine",
  "billingState": "CA",
  "billingZip": "92617",
  "insurancePolicyNumber": null,
  "insuranceCompanyName": null,
  "createdAt": "2026-01-15T09:00:00Z"
}
```

---

### 4. ServiceCatalogController

Manages the master service catalog -- the list of available service types with base pricing. Active entries are readable by any authenticated user for use when building job requests; full CRUD is restricted to PILOT and ADMIN.

**Base path:** `/api/service-catalog`

**Access:** `GET /api/service-catalog/active` -- any authenticated user. All other paths -- PILOT or ADMIN.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| GET | /api/service-catalog/active | List active service types | none | `List<ServiceCatalogResponse>` | 200, 401 | Any authenticated |
| GET | /api/service-catalog | List all service types (incl. inactive) | none | `List<ServiceCatalogResponse>` | 200, 401, 403 | PILOT, ADMIN |
| GET | /api/service-catalog/{id} | Get single service type | none | `ServiceCatalogResponse` | 200, 401, 403, 404 | PILOT, ADMIN |
| POST | /api/service-catalog | Create a service type | `ServiceCatalogRequest` | `ServiceCatalogResponse` | 201, 400, 401, 403 | PILOT, ADMIN |
| PUT | /api/service-catalog/{id} | Replace a service type | `ServiceCatalogRequest` | `ServiceCatalogResponse` | 200, 400, 401, 403, 404 | PILOT, ADMIN |
| DELETE | /api/service-catalog/{id} | Delete a service type | none | none | 204, 401, 403, 404 | PILOT, ADMIN |

**Sample -- GET /api/service-catalog/active:**

```json
[
  {
    "id": "a1b2c3d4-...",
    "jobType": "AERIAL_PHOTOGRAPHY",
    "name": "Standard Aerial Photo Package",
    "description": "Full property exterior aerial photography, up to 30 minutes flight time.",
    "basePrice": 250.00,
    "estimatedDurationMinutes": 60,
    "active": true,
    "sortOrder": 1,
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
]
```

---

### 5. DroneProfileController

Manages a pilot's aircraft fleet. Ownership is enforced at the service layer -- a pilot can only access their own drone records.

**Base path:** `/api/drones`

**Access:** Authenticated (catch-all rule). Service layer enforces per-pilot ownership.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/drones | Register a drone | `DroneProfileRequest` | `DroneProfileResponse` | 200, 400, 401 | Authenticated |
| GET | /api/drones | List own drones | none | `List<DroneProfileResponse>` | 200, 401 | Authenticated |
| GET | /api/drones/{id} | Get own drone | none | `DroneProfileResponse` | 200, 401, 404 | Authenticated |
| PUT | /api/drones/{id} | Update own drone | `DroneProfileRequest` | `DroneProfileResponse` | 200, 400, 401, 404 | Authenticated |
| DELETE | /api/drones/{id} | Delete own drone | none | none | 204, 401, 404 | Authenticated |

**Sample -- POST /api/drones:**

```
POST /api/drones HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mavic 3 Pro",
  "manufacturer": "DJI",
  "model": "Mavic 3 Pro",
  "serialNumber": "DJI1234567",
  "faaRegistration": "FA-123456",
  "weightGrams": 895,
  "maxWindMph": 27,
  "maxGustMph": 33,
  "notes": "Primary inspection drone.",
  "active": true
}
```

```json
{
  "id": "b2c3d4e5-...",
  "pilotId": "3f2a1b4c-...",
  "name": "Mavic 3 Pro",
  "manufacturer": "DJI",
  "model": "Mavic 3 Pro",
  "serialNumber": "DJI1234567",
  "faaRegistration": "FA-123456",
  "weightGrams": 895,
  "maxWindMph": 27,
  "maxGustMph": 33,
  "notes": "Primary inspection drone.",
  "active": true,
  "createdAt": "2026-04-23T18:30:00Z"
}
```

---

### 6. ClientController

Manages a pilot's private client directory. Each client record belongs to one pilot and is not visible to other pilots.

**Base path:** `/api/clients`

**Access:** Authenticated (catch-all rule). Service layer scopes all queries to the calling pilot's records.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/clients | Create a client record | `ClientRequest` | `ClientResponse` | 200, 400, 401 | Authenticated |
| GET | /api/clients | List own clients | none | `List<ClientResponse>` | 200, 401 | Authenticated |
| GET | /api/clients/{id} | Get own client | none | `ClientResponse` | 200, 401, 404 | Authenticated |
| PUT | /api/clients/{id} | Update own client | `ClientRequest` | `ClientResponse` | 200, 400, 401, 404 | Authenticated |
| DELETE | /api/clients/{id} | Delete own client | none | none | 204, 401, 404 | Authenticated |

**Sample -- POST /api/clients:**

```
POST /api/clients HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Insurance Co.",
  "email": "claims@acme.com",
  "phone": "555-0200",
  "company": "Acme Insurance",
  "clientType": "INSURANCE_COMPANY",
  "address": "200 Market St, Irvine, CA 92612",
  "notes": "Preferred partner for storm claims."
}
```

```json
{
  "id": "c3d4e5f6-...",
  "pilotId": "3f2a1b4c-...",
  "name": "Acme Insurance Co.",
  "email": "claims@acme.com",
  "phone": "555-0200",
  "company": "Acme Insurance",
  "clientType": "INSURANCE_COMPANY",
  "address": "200 Market St, Irvine, CA 92612",
  "notes": "Preferred partner for storm claims.",
  "createdAt": "2026-04-23T18:30:00Z"
}
```

---

### 7. JobRequestController

Manages the job intake workflow -- submission by requesters, review by pilots or admins, and cancellation.

**Base path:** `/api/job-requests`

**Access:**

| Pattern | Access |
|---|---|
| POST /api/job-requests | Authenticated |
| GET /api/job-requests | Authenticated (role-filtered: PILOT sees pending, ADMIN sees all, others see own) |
| GET /api/job-requests/all | PILOT or ADMIN |
| GET /api/job-requests/{id} | Authenticated |
| POST /api/job-requests/{id}/decide | PILOT or ADMIN |
| POST /api/job-requests/{id}/cancel | Authenticated |

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/job-requests | Submit a job request | `JobRequestSubmitRequest` | `JobRequestResponse` | 201, 400, 401 | Authenticated |
| GET | /api/job-requests | List requests (role-filtered) | none | `List<JobRequestResponse>` | 200, 401 | Authenticated |
| GET | /api/job-requests/all | List all requests | none | `List<JobRequestResponse>` | 200, 401, 403 | PILOT, ADMIN |
| GET | /api/job-requests/{id} | Get a single request | none | `JobRequestResponse` | 200, 401, 404 | Authenticated |
| POST | /api/job-requests/{id}/decide | Accept or reject a request | `JobRequestDecisionRequest` | `JobRequestResponse` | 200, 400, 401, 403 | PILOT, ADMIN |
| POST | /api/job-requests/{id}/cancel | Cancel a pending request | none | `JobRequestResponse` | 200, 401, 404 | Authenticated |

When a request is accepted via `/decide`, the backend automatically creates a `Job` record and a `ServiceAgreement`. The response includes a non-null `createdJobId` field pointing to the new job.

**Sample -- POST /api/job-requests:**

```
POST /api/job-requests HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "lineItems": [
    { "pilotServiceId": "a1b2c3d4-...", "quantity": 1 }
  ],
  "siteAddress": "1234 Elm St, Los Angeles, CA 90001",
  "siteLat": 34.052235,
  "siteLon": -118.243683,
  "requestedDate": "2026-05-10",
  "requestedTime": "09:00:00",
  "notes": "Roof inspection after recent storm.",
  "claimNumber": "CLM-2026-00441",
  "policyNumber": "POL-88773",
  "insuranceCompanyName": "Acme Insurance",
  "adjusterName": "Bob Martinez",
  "adjusterEmail": "bob.m@acme.com",
  "adjusterPhone": "555-0301",
  "lossDate": "2026-04-15",
  "lossType": "STORM",
  "propertyType": "RESIDENTIAL",
  "inspectionScope": "Full exterior roof and structural assessment."
}
```

```json
{
  "id": "d4e5f6a7-...",
  "requesterId": "7d8e9f0a-...",
  "reviewedByPilotId": null,
  "status": "PENDING",
  "siteAddress": "1234 Elm St, Los Angeles, CA 90001",
  "siteLat": 34.052235,
  "siteLon": -118.243683,
  "requestedDate": "2026-05-10",
  "requestedTime": "09:00:00",
  "isRecurring": null,
  "recurrencePattern": null,
  "notes": "Roof inspection after recent storm.",
  "rateCardTotal": 250.00,
  "discountPercent": null,
  "finalAmount": 250.00,
  "proposedBudget": null,
  "claimNumber": "CLM-2026-00441",
  "policyNumber": "POL-88773",
  "insuranceCompanyName": "Acme Insurance",
  "adjusterName": "Bob Martinez",
  "adjusterEmail": "bob.m@acme.com",
  "adjusterPhone": "555-0301",
  "lossDate": "2026-04-15",
  "lossType": "STORM",
  "propertyType": "RESIDENTIAL",
  "inspectionScope": "Full exterior roof and structural assessment.",
  "lineItems": [],
  "createdJobId": null,
  "decidedAt": null,
  "decisionNotes": null,
  "createdAt": "2026-04-23T18:30:00Z",
  "updatedAt": "2026-04-23T18:30:00Z"
}
```

**Sample -- POST /api/job-requests/{id}/decide:**

```
POST /api/job-requests/d4e5f6a7-.../decide HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "decision": "ACCEPT",
  "decisionNotes": "Confirmed availability. Will schedule for May 10."
}
```

```json
{
  "id": "d4e5f6a7-...",
  "status": "ACCEPTED",
  "reviewedByPilotId": "3f2a1b4c-...",
  "createdJobId": "e5f6a7b8-...",
  "decidedAt": "2026-04-23T18:35:00Z",
  "decisionNotes": "Confirmed availability. Will schedule for May 10."
}
```

---

### 8. JobController

Manages job records created after a request is accepted. All four roles may access jobs; the service layer filters each role's visible set appropriately.

**Base path:** `/api/jobs`

**Access:** PILOT, COMPANY, CLIENT, ADMIN (explicit URL rule). Service layer applies per-role filtering.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/jobs | Create a job directly | `JobCreateRequest` | `JobResponse` | 200, 400, 401 | Authenticated |
| GET | /api/jobs | List jobs (role-filtered) | none | `List<JobResponse>` | 200, 401 | Authenticated |
| GET | /api/jobs/{id} | Get a single job | none | `JobResponse` | 200, 401, 404 | Authenticated |
| PUT | /api/jobs/{id} | Replace a job | `JobCreateRequest` | `JobResponse` | 200, 400, 401, 404 | Authenticated |
| PATCH | /api/jobs/{id}/status | Update job status | `JobStatusUpdateRequest` | `JobResponse` | 200, 400, 401, 404 | Authenticated |
| PATCH | /api/jobs/{id}/accept | Mark job as accepted | none | `JobResponse` | 200, 401, 404 | Authenticated |
| DELETE | /api/jobs/{id} | Delete a job | none | none | 204, 401, 404 | Authenticated |

`GET /api/jobs` returns: ADMIN -- all jobs; PILOT -- jobs owned by the calling pilot; CLIENT -- jobs linked to the calling client user; COMPANY -- all company-type jobs.

`JobStatus` values (state machine): `REQUESTED`, `ACCEPTED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `DELIVERED`, `CANCELLED`.

**Sample -- PATCH /api/jobs/{id}/status:**

```
PATCH /api/jobs/e5f6a7b8-.../status HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

```json
{
  "id": "e5f6a7b8-...",
  "title": "Storm Inspection -- 1234 Elm St",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-04-23T19:00:00Z"
}
```

---

### 9. MissionController

Manages individual flight sessions within a job. A job may have multiple missions.

**Base path:** `/api/missions`

**Access:** Authenticated (catch-all rule).

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/missions | Create a mission | `MissionRequest` | `MissionResponse` | 200, 400, 401 | Authenticated |
| GET | /api/missions/job/{jobId} | List missions for a job | none | `List<MissionResponse>` | 200, 401 | Authenticated |
| GET | /api/missions/{id} | Get a single mission | none | `MissionResponse` | 200, 401, 404 | Authenticated |
| PATCH | /api/missions/{id}/complete | Mark mission complete and log weather | `MissionCompletionRequest` | `MissionResponse` | 200, 400, 401, 404 | Authenticated |
| DELETE | /api/missions/{id} | Delete a mission | none | none | 204, 401, 404 | Authenticated |

**Sample -- POST /api/missions:**

```
POST /api/missions HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "e5f6a7b8-...",
  "droneProfileId": "b2c3d4e5-...",
  "flightDate": "2026-05-10",
  "flightTime": "09:30:00",
  "notes": "Primary exterior sweep from north-facing approach."
}
```

```json
{
  "id": "f6a7b8c9-...",
  "jobId": "e5f6a7b8-...",
  "jobTitle": "Storm Inspection -- 1234 Elm St",
  "pilotId": "3f2a1b4c-...",
  "droneProfileId": "b2c3d4e5-...",
  "droneName": "Mavic 3 Pro",
  "flightDate": "2026-05-10",
  "flightTime": "09:30:00",
  "durationMinutes": null,
  "weatherTempF": null,
  "weatherWindMph": null,
  "weatherGustMph": null,
  "weatherConditions": null,
  "weatherVisibility": null,
  "flyScore": null,
  "status": "SCHEDULED",
  "notes": "Primary exterior sweep from north-facing approach.",
  "createdAt": "2026-04-23T19:00:00Z"
}
```

**Sample -- PATCH /api/missions/{id}/complete:**

```
PATCH /api/missions/f6a7b8c9-.../complete HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "durationMinutes": 42,
  "weatherTempF": 68.5,
  "weatherWindMph": 9.0,
  "weatherGustMph": 13.0,
  "weatherConditions": "Partly Cloudy",
  "weatherVisibility": "10 miles",
  "flyScore": 87,
  "notes": "Flight completed without incident."
}
```

---

### 10. DocumentController

Manages file uploads per job or mission, deliverable flagging, and file downloads. Files are stored on the API host at `./uploads/<jobId>/<filename>`. Generated PDFs are at `./uploads/pdfs/`.

**Base path:** `/api/documents`

**Access:** Authenticated (explicit URL rule). Downloaded files at `/uploads/**` are served publicly (no auth required for direct file URLs).

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/documents/upload | Upload a file | multipart/form-data | `DocumentResponse` | 200, 400, 401, 500 | Authenticated |
| GET | /api/documents/job/{jobId} | List all documents for a job | none | `List<DocumentResponse>` | 200, 401 | Authenticated |
| GET | /api/documents/job/{jobId}/deliverables | List deliverables only | none | `List<DocumentResponse>` | 200, 401 | Authenticated |
| GET | /api/documents/mission/{missionId} | List documents for a mission | none | `List<DocumentResponse>` | 200, 401 | Authenticated |
| GET | /api/documents/{id}/download | Download file (inline or attachment) | none | Binary file | 200, 401, 404 | Authenticated |
| PATCH | /api/documents/{id}/deliverable | Toggle deliverable flag | `DeliverableToggleRequest` | `DocumentResponse` | 200, 400, 401, 404 | Authenticated |
| DELETE | /api/documents/{id} | Delete a document | none | none | 204, 401, 404 | Authenticated |

See Section -- File Uploads for multipart form details.

**Sample -- GET /api/documents/job/{jobId}/deliverables:**

```json
[
  {
    "id": "g7h8i9j0-...",
    "jobId": "e5f6a7b8-...",
    "missionId": "f6a7b8c9-...",
    "uploadedById": "3f2a1b4c-...",
    "uploaderName": "Jane Doe",
    "fileName": "roof-north-pass.jpg",
    "fileType": "IMAGE",
    "filePath": "./uploads/e5f6a7b8-.../roof-north-pass.jpg",
    "fileSizeBytes": 3145728,
    "thumbnailPath": null,
    "mimeType": "image/jpeg",
    "description": "North-facing roof pass at 150 ft AGL.",
    "tags": "roof,north,pass1",
    "category": "AERIAL_PHOTO",
    "isDeliverable": true,
    "downloadUrl": "http://localhost:8081/uploads/e5f6a7b8-.../roof-north-pass.jpg",
    "createdAt": "2026-05-10T11:30:00Z"
  }
]
```

---

### 11. InspectionReportController

Manages the structured inspection report lifecycle for a job: draft creation/update, pilot submission, and reviewer approval or rejection.

**Base path:** `/api/inspection-reports`

**Access:** Authenticated (catch-all rule). The pilot creates and submits; a reviewer (COMPANY or ADMIN) records the decision.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/inspection-reports/job/{jobId} | Create or update report | `InspectionReportRequest` | `InspectionReportResponse` | 200, 400, 401, 404 | Authenticated |
| GET | /api/inspection-reports/job/{jobId} | Get report for a job | none | `InspectionReportResponse` | 200, 401, 404 | Authenticated |
| PATCH | /api/inspection-reports/job/{jobId}/submit | Submit report for review | none | `InspectionReportResponse` | 200, 401, 404 | Authenticated |
| PATCH | /api/inspection-reports/job/{jobId}/review | Record approval or rejection | `ReportReviewRequest` | `InspectionReportResponse` | 200, 400, 401, 404 | Authenticated |

`ReportStatus` values: `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`. The `review` endpoint accepts `APPROVED` or `REJECTED` as the `decision` field.

**Sample -- POST /api/inspection-reports/job/{jobId}:**

```
POST /api/inspection-reports/job/e5f6a7b8-.../ HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportDate": "2026-05-10",
  "propertyCondition": "FAIR",
  "damageFound": true,
  "damageSummary": "Significant shingle loss on north and west slopes. Fascia damage visible on southwest corner.",
  "roofCondition": "POOR",
  "exteriorCondition": "FAIR",
  "additionalFindings": "Gutters detached on north side.",
  "recommendations": "Full roof replacement recommended. Gutter reattachment required.",
  "pilotSignature": "Jane Doe, FAA Part 107"
}
```

```json
{
  "id": "h8i9j0k1-...",
  "jobId": "e5f6a7b8-...",
  "pilotId": "3f2a1b4c-...",
  "pilotName": "Jane Doe",
  "reportDate": "2026-05-10",
  "propertyCondition": "FAIR",
  "damageFound": true,
  "damageSummary": "Significant shingle loss on north and west slopes. Fascia damage visible on southwest corner.",
  "roofCondition": "POOR",
  "exteriorCondition": "FAIR",
  "additionalFindings": "Gutters detached on north side.",
  "recommendations": "Full roof replacement recommended. Gutter reattachment required.",
  "pilotSignature": "Jane Doe, FAA Part 107",
  "status": "DRAFT",
  "reviewerNotes": null,
  "reviewedById": null,
  "reviewedAt": null,
  "createdAt": "2026-05-10T12:00:00Z",
  "updatedAt": "2026-05-10T12:00:00Z"
}
```

**Sample -- PATCH /api/inspection-reports/job/{jobId}/review:**

```
PATCH /api/inspection-reports/job/e5f6a7b8-.../review HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "decision": "APPROVED",
  "notes": "Report accepted. Coverage sufficient for claim CLM-2026-00441."
}
```

---

### 12. AgreementController

Retrieves service agreements that are automatically created when a job request is accepted. Supports PDF download.

**Base path:** `/api/agreements`

**Access:** Authenticated (explicit URL rule). Service layer checks caller is a party to the agreement.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| GET | /api/agreements/{id} | Get agreement by ID | none | `AgreementResponse` | 200, 401, 404 | Authenticated |
| GET | /api/agreements/by-job/{jobId} | Get agreement for a job | none | `AgreementResponse` | 200, 401, 404 | Authenticated |
| GET | /api/agreements/{id}/pdf | Download agreement PDF | none | Binary PDF | 200, 401, 404 | Authenticated |

`Content-Disposition: attachment; filename="agreement-<id>.pdf"` on PDF downloads. `Content-Type: application/pdf`.

**Sample -- GET /api/agreements/by-job/{jobId}:**

```json
{
  "id": "i9j0k1l2-...",
  "jobId": "e5f6a7b8-...",
  "agreementNumber": "AGR-2026-00441",
  "status": "SIGNED",
  "signedAt": "2026-04-23T18:35:00Z",
  "signedByName": "Jane Doe",
  "signedByEmail": "pilot@example.com",
  "pdfPath": "./uploads/pdfs/agreements/agreement-i9j0k1l2-....pdf",
  "createdAt": "2026-04-23T18:35:00Z"
}
```

---

### 13. InvoiceController

Manages invoices created by pilots for completed jobs. Supports line items, status transitions, and PDF generation.

**Base path:** `/api/invoices`

**Access:** Authenticated (catch-all rule). Service layer enforces role-specific visibility (CLIENT sees their own invoices, PILOT sees invoices they created).

`InvoiceStatus` values: `DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/invoices | Create an invoice | `InvoiceRequest` | `InvoiceResponse` | 200, 400, 401 | Authenticated |
| GET | /api/invoices | List invoices (role-filtered) | none | `List<InvoiceResponse>` | 200, 401 | Authenticated |
| GET | /api/invoices/{id} | Get a single invoice | none | `InvoiceResponse` | 200, 401, 404 | Authenticated |
| GET | /api/invoices/by-job/{jobId} | Get invoice for a job | none | `InvoiceResponse` | 200, 401, 404 | Authenticated |
| PATCH | /api/invoices/{id}/status | Update invoice status | `InvoiceStatusUpdateRequest` | `InvoiceResponse` | 200, 400, 401, 404 | Authenticated |
| DELETE | /api/invoices/{id} | Delete a DRAFT invoice | none | none | 204, 401, 404 | Authenticated |
| GET | /api/invoices/{id}/pdf | Download invoice PDF | none | Binary PDF | 200, 401, 404 | Authenticated |

`Content-Disposition: attachment; filename="invoice-<id>.pdf"` on PDF downloads.

**Sample -- POST /api/invoices:**

```
POST /api/invoices HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "e5f6a7b8-...",
  "taxAmount": 22.50,
  "dueDate": "2026-06-01",
  "notes": "Storm inspection completed May 10, 2026.",
  "lineItems": [
    {
      "description": "Standard Aerial Photo Package",
      "quantity": 1,
      "unitPrice": 250.00,
      "sortOrder": 1
    },
    {
      "description": "Inspection Report Preparation",
      "quantity": 1,
      "unitPrice": 75.00,
      "sortOrder": 2
    }
  ]
}
```

```json
{
  "id": "j0k1l2m3-...",
  "jobId": "e5f6a7b8-...",
  "jobTitle": "Storm Inspection -- 1234 Elm St",
  "pilotId": "3f2a1b4c-...",
  "invoiceNumber": "INV-2026-00107",
  "clientId": "c3d4e5f6-...",
  "clientName": "Acme Insurance Co.",
  "amount": 325.00,
  "taxAmount": 22.50,
  "totalAmount": 347.50,
  "status": "DRAFT",
  "dueDate": "2026-06-01",
  "paidDate": null,
  "notes": "Storm inspection completed May 10, 2026.",
  "lineItems": [
    { "id": "...", "description": "Standard Aerial Photo Package", "quantity": 1, "unitPrice": 250.00, "amount": 250.00, "sortOrder": 1 },
    { "id": "...", "description": "Inspection Report Preparation", "quantity": 1, "unitPrice": 75.00, "amount": 75.00, "sortOrder": 2 }
  ],
  "createdAt": "2026-05-12T10:00:00Z",
  "updatedAt": "2026-05-12T10:00:00Z"
}
```

---

### 14. PaymentController

Integrates with Stripe Checkout to create payment sessions for outstanding invoices. The webhook endpoint is public and verified by Stripe request signature.

**Base path:** `/api/payments`

**Access:**

| Pattern | Access |
|---|---|
| POST /api/payments/checkout-session/{invoiceId} | Authenticated |
| POST /api/payments/webhook | Public (Stripe-signed) |

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| POST | /api/payments/checkout-session/{invoiceId} | Create Stripe checkout session | none | `StripeCheckoutResult` | 200, 401, 404 | Authenticated |
| POST | /api/payments/webhook | Receive Stripe webhook event | Raw payload string | none | 200 | Public |

When `STRIPE_SECRET_KEY` is empty or absent, `StripeService` returns a mock checkout result redirecting to `STRIPE_SUCCESS_URL?mock=true` rather than creating a live Stripe session. This allows local development without Stripe credentials.

**Sample -- POST /api/payments/checkout-session/{invoiceId}:**

```
POST /api/payments/checkout-session/j0k1l2m3-... HTTP/1.1
Host: localhost:8081
Authorization: Bearer <token>
```

```json
{
  "sessionId": "cs_test_a1b2c3d4...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4..."
}
```

The browser redirects to `url`. After payment Stripe posts `checkout.session.completed` to `/api/payments/webhook`. The handler verifies the `Stripe-Signature` header via `Stripe.Webhook.constructEvent()`, extracts the invoice ID from event metadata, transitions the invoice to `PAID`, records the paid date, and creates a `Payment` record. Then Stripe redirects the user to `STRIPE_SUCCESS_URL`.

**Webhook request (sent by Stripe):**

```
POST /api/payments/webhook HTTP/1.1
Host: localhost:8081
Content-Type: application/json
Stripe-Signature: t=...,v1=...

{ "type": "checkout.session.completed", ... }
```

Response is always `200 OK`. Errors are logged internally but not re-surfaced to Stripe.

---

### 15. DashboardController

Returns role-aware aggregate statistics for the authenticated user's dashboard view.

**Base path:** `/api/dashboard`

**Access:** Authenticated (catch-all rule). Response content varies by role.

| Method | Path | Purpose | Request Body | Response | Status Codes | Role |
|---|---|---|---|---|---|---|
| GET | /api/dashboard | Get dashboard stats | none | `DashboardResponse` | 200, 401 | Authenticated |

Role dispatch:

- `COMPANY` -- calls `getCompanyDashboard(userId)` -- returns open request counts, completed inspection counts, total spent
- `CLIENT` -- calls `getClientDashboard(userId)` -- returns pending, active, and awaiting-payment request counts
- `PILOT` and `ADMIN` -- calls `getPilotDashboard(userId)` -- returns mission counts, active job count, upcoming flight count, monthly revenue

**Sample -- GET /api/dashboard (PILOT role):**

```json
{
  "totalMissionCount": 42,
  "completedMissionCount": 38,
  "revenueTotal": 10500.00,
  "activeProjectCount": 4,
  "totalSpent": null,
  "openClaimCount": null,
  "closedClaimCount": null,
  "activeJobCount": 4,
  "pendingInspectionCount": 2,
  "upcomingFlightCount": 3,
  "monthRevenue": 1750.00,
  "openRequestCount": null,
  "pendingReviewCount": null,
  "completedInspectionCount": null,
  "recentJobs": [],
  "recentDocuments": []
}
```

Fields not applicable to the calling role are returned as `null`.

---

## DTO Reference

### AuthLoginRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| email | String | Yes | valid email, not blank | Trimmed before processing |
| password | String | Yes | not blank | Plaintext; hashed server-side via BCrypt |

### AuthRegisterRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| email | String | Yes | valid email, not blank | Trimmed |
| password | String | Yes | min 8 characters | Plaintext; hashed server-side |
| role | String | No | -- | PILOT, COMPANY, CLIENT, or ADMIN; defaults to PILOT if omitted |
| firstName | String | No | -- | |
| lastName | String | No | -- | |
| phone | String | No | -- | |
| company | String | No | -- | |
| licenseNumber | String | No | -- | FAA Part 107 certificate number |

### AuthResponse

| Field | Type | Notes |
|---|---|---|
| id | String | User UUID |
| email | String | |
| role | String | PILOT, COMPANY, CLIENT, or ADMIN |
| firstName | String | |
| lastName | String | |
| company | String | |
| token | String | Signed HS256 JWT; valid for 480 minutes |

### CurrentUserResponse

| Field | Type | Notes |
|---|---|---|
| id | String | User UUID |
| email | String | |
| role | String | |

### UserProfileUpdateRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| email | String | No | valid email, max 255 | |
| firstName | String | No | max 100 | |
| lastName | String | No | max 100 | |
| phone | String | No | max 50 | |
| company | String | No | max 255 | |
| licenseNumber | String | No | max 50 | FAA Part 107 number |
| businessName | String | No | max 255 | LLC or DBA name |
| ein | String | No | max 50 | Federal tax ID |
| llcVerified | Boolean | No | -- | |
| paymentTerms | PaymentTerms | No | -- | Enum; see Swagger UI for values |
| billingAddress | String | No | max 500 | |
| billingCity | String | No | max 100 | |
| billingState | String | No | max 50 | |
| billingZip | String | No | max 20 | |
| insurancePolicyNumber | String | No | max 100 | |
| insuranceCompanyName | String | No | max 255 | |

### ServiceCatalogRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| jobType | JobType | Yes | not null | Enum; see Swagger UI for values |
| name | String | Yes | not blank, max 100 | |
| description | String | No | max 1000 | |
| basePrice | BigDecimal | Yes | not null | |
| estimatedDurationMinutes | Integer | No | -- | |
| active | Boolean | No | -- | Defaults to true if omitted |
| sortOrder | Integer | No | -- | Display order |

### DroneProfileRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| name | String | Yes | not blank, max 100 | |
| manufacturer | String | No | max 100 | |
| model | String | No | max 100 | |
| serialNumber | String | No | max 100 | |
| faaRegistration | String | No | max 50 | FAA drone registration number |
| weightGrams | Integer | No | -- | Total takeoff weight in grams |
| maxWindMph | Integer | No | -- | Operational wind limit |
| maxGustMph | Integer | No | -- | Operational gust limit |
| notes | String | No | -- | |
| active | Boolean | No | -- | |

### ClientRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| name | String | Yes | not blank, max 255 | |
| email | String | No | valid email, max 255 | |
| phone | String | No | max 50 | |
| company | String | No | max 255 | |
| clientType | ClientType | Yes | not null | Enum; see Swagger UI for values |
| address | String | No | max 500 | |
| notes | String | No | -- | |

### JobRequestSubmitRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| lineItems | List of JobRequestLineItemSubmitRequest | Yes | min 1 item | |
| siteAddress | String | Yes | not blank, max 500 | |
| siteLat | BigDecimal | No | -- | |
| siteLon | BigDecimal | No | -- | |
| requestedDate | LocalDate | No | -- | |
| requestedTime | LocalTime | No | -- | |
| isRecurring | Boolean | No | -- | |
| recurrencePattern | String | No | max 100 | |
| notes | String | No | -- | |
| proposedBudget | BigDecimal | No | -- | |
| claimNumber | String | No | max 100 | Insurance claim identifier |
| policyNumber | String | No | max 100 | |
| insuranceCompanyName | String | No | max 255 | |
| adjusterName | String | No | max 255 | |
| adjusterEmail | String | No | valid email, max 255 | |
| adjusterPhone | String | No | max 50 | |
| lossDate | LocalDate | No | -- | Date of insured loss event |
| lossType | LossType | No | -- | Enum: STORM, FIRE, HAIL, WATER, WIND, and others |
| propertyType | PropertyType | No | -- | Enum: RESIDENTIAL, COMMERCIAL, and others |
| inspectionScope | String | No | -- | Free text description of inspection scope |

### JobRequestLineItemSubmitRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| pilotServiceId | UUID | Yes | not null | FK to pilot_services table |
| quantity | Integer | Yes | min 1 | |

### JobRequestDecisionRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| decision | String | Yes | not blank | "ACCEPT" or "REJECT" |
| decisionNotes | String | No | max 1000 | Optional reviewer commentary |

### JobCreateRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| clientId | UUID | Yes | not null | |
| title | String | Yes | not blank, max 255 | |
| description | String | No | -- | |
| jobType | JobType | Yes | not null | Enum; see Swagger UI for values |
| priority | JobPriority | No | -- | Enum; see Swagger UI for values |
| siteAddress | String | Yes | not blank, max 500 | |
| siteLat | BigDecimal | No | -- | |
| siteLon | BigDecimal | No | -- | |
| scheduledDate | LocalDate | No | -- | |
| scheduledTime | LocalTime | No | -- | |
| estimatedDuration | Integer | No | -- | Duration in minutes |
| notes | String | No | -- | |
| claimNumber | String | No | max 100 | |
| policyNumber | String | No | max 100 | |
| insuranceCompanyName | String | No | max 255 | |
| adjusterName | String | No | max 255 | |
| adjusterEmail | String | No | valid email, max 255 | |
| adjusterPhone | String | No | max 50 | |
| lossDate | LocalDate | No | -- | |
| lossType | LossType | No | -- | |
| propertyType | PropertyType | No | -- | |
| inspectionScope | String | No | -- | |

### MissionRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| jobId | UUID | Yes | not null | |
| droneProfileId | UUID | No | -- | Optional; links mission to a specific drone |
| flightDate | LocalDate | Yes | not null | |
| flightTime | LocalTime | No | -- | |
| notes | String | No | -- | |

### MissionCompletionRequest

| Field | Type | Required | Notes |
|---|---|---|---|
| durationMinutes | Integer | No | Actual flight duration |
| weatherTempF | Double | No | |
| weatherWindMph | Double | No | |
| weatherGustMph | Double | No | |
| weatherConditions | String | No | Free text (e.g., "Partly Cloudy") |
| weatherVisibility | String | No | Free text (e.g., "10 miles") |
| flyScore | Integer | No | 0 to 100 composite score |
| notes | String | No | |

### InspectionReportRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| reportDate | LocalDate | Yes | not null | |
| propertyCondition | PropertyCondition | Yes | not null | Enum: EXCELLENT, GOOD, FAIR, POOR |
| damageFound | Boolean | Yes | not null | |
| damageSummary | String | No | -- | Expected when damageFound is true; enforced by service |
| roofCondition | ConditionRating | No | -- | Enum; see Swagger UI for values |
| exteriorCondition | ConditionRating | No | -- | Enum; see Swagger UI for values |
| additionalFindings | String | No | -- | |
| recommendations | String | No | -- | |
| pilotSignature | String | No | -- | Name and credential string |

### ReportReviewRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| decision | ReportStatus | Yes | not null | APPROVED or REJECTED |
| notes | String | No | -- | Reviewer commentary |

### InvoiceRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| jobId | UUID | Yes | not null | |
| taxAmount | BigDecimal | No | -- | |
| dueDate | LocalDate | No | -- | |
| notes | String | No | -- | |
| lineItems | List of LineItemRequest | Yes | not null | |

### LineItemRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| description | String | Yes | not blank, max 255 | |
| quantity | BigDecimal | Yes | not null | |
| unitPrice | BigDecimal | Yes | not null | |
| sortOrder | Integer | No | -- | Display order |

### DeliverableToggleRequest

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| isDeliverable | Boolean | Yes | not null | |

### StripeCheckoutResult

| Field | Type | Notes |
|---|---|---|
| sessionId | String | Stripe session ID; null when mock mode is active |
| url | String | Redirect URL -- Stripe-hosted checkout or mock success URL |

---

## File Uploads (Multipart)

Document uploads use `POST /api/documents/upload` with `Content-Type: multipart/form-data`.

**Form parts:**

| Part name | Type | Required | Notes |
|---|---|---|---|
| file | binary | Yes | The file to upload |
| jobId | UUID string | Yes | Job the document belongs to |
| missionId | UUID string | No | Optional mission association |
| category | DocumentCategory string | Yes | Enum: see Swagger UI for full list (includes AERIAL_PHOTO, VIDEO, THERMAL, REPORT, MAP, and others) |
| description | String | No | |
| tags | String | No | Comma-separated freeform tags |
| isDeliverable | Boolean string | No | Default false |

**Limits:**

- Max file size per upload: 50 MB (`spring.servlet.multipart.max-file-size=50MB`)
- Max total request size: 100 MB (`spring.servlet.multipart.max-request-size=100MB`)

**Storage:** Files are written to `./uploads/<jobId>/<original-filename>` on the API host's local disk. The response includes a `downloadUrl` pointing to the static `/uploads/**` path.

**Retrieval:** `GET /api/documents/{id}/download` serves the file from disk with `Content-Type` matching the stored MIME type and either `Content-Disposition: inline` (images, PDFs) or `Content-Disposition: attachment` (other types). Direct `/uploads/**` URLs are also publicly accessible without authentication -- a known limitation for production deployment.

**Sample curl:**

```bash
curl -X POST http://localhost:8081/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/roof-photo.jpg" \
  -F "jobId=e5f6a7b8-..." \
  -F "category=AERIAL_PHOTO" \
  -F "description=North roof pass" \
  -F "isDeliverable=true"
```

---

## Stripe Payment Integration

### Checkout Flow

1. Caller posts to `POST /api/payments/checkout-session/{invoiceId}` with a valid JWT.
2. `PaymentService` validates that the invoice is accessible to the caller and is in a payable state.
3. If `STRIPE_SECRET_KEY` is configured, `StripeService.createCheckoutSession()` creates a real Stripe Checkout Session and returns its URL. The session includes the invoice ID in session metadata for webhook correlation.
4. If `STRIPE_SECRET_KEY` is empty or absent, `StripeService` logs a warning and returns a mock result pointing to `STRIPE_SUCCESS_URL?mock=true`. No real payment occurs.
5. The caller's browser redirects to the returned `url`.

### Webhook Processing

- Endpoint: `POST /api/payments/webhook` (public, no JWT required)
- Stripe posts `checkout.session.completed` events to this endpoint after a successful payment.
- The handler calls `Stripe.Webhook.constructEvent(payload, sigHeader, STRIPE_WEBHOOK_SECRET)` to verify the request signature. Requests with invalid signatures are rejected.
- On verification success: `PaymentService.handleWebhookEvent()` extracts the invoice ID from `session.metadata.invoiceId`, sets the invoice status to `PAID`, sets `paidDate`, and creates a `Payment` record with `method = CREDIT_CARD`.
- The endpoint returns `200 OK` in all cases; errors are logged internally.

### Mock Mode

When `STRIPE_SECRET_KEY` is empty, the checkout result `url` points directly to `STRIPE_SUCCESS_URL?mock=true`. The webhook is not called in mock mode -- invoice status must be updated manually via `PATCH /api/invoices/{id}/status` if testing the full PAID transition locally without Stripe keys.

---

## Error Handling

All error responses use the envelope described in API Conventions. Examples per status code:

**400 Bad Request (validation failure):**

```json
{
  "timestamp": "2026-04-23T18:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is required., Password must be at least 8 characters."
}
```

**401 Unauthorized (missing or expired token):**

```json
{
  "timestamp": "2026-04-23T18:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required."
}
```

**403 Forbidden (insufficient role):**

```json
{
  "timestamp": "2026-04-23T18:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Pilots and admins only"
}
```

**404 Not Found:**

```json
{
  "timestamp": "2026-04-23T18:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Job not found: e5f6a7b8-..."
}
```

**500 Internal Server Error:**

```json
{
  "timestamp": "2026-04-23T18:30:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred."
}
```

`GlobalExceptionHandler` catches: `ApiException` (maps to its configured HTTP status), `MethodArgumentNotValidException` (400, field messages joined by `, `), `ConstraintViolationException` (400), and any unhandled `Exception` (500). Custom exception classes that extend `ApiException` include: `ResourceNotFoundException` (404), `UnauthorizedException` (401 or 403), `BadRequestException` (400), `DuplicateEmailException` (409), and `PdfGenerationException` (500).

---

## OpenAPI / Swagger

Interactive API documentation is generated by springdoc-openapi and is available at:

- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI 3 JSON spec: `http://localhost:8081/v3/api-docs`

Both endpoints are public (no authentication required). The spec is generated from `@Operation` and `@ApiResponse` annotations on controllers. Not all controllers carry full annotation coverage -- `AuthController` has `@Operation` summaries, `DashboardController` has none. The Swagger UI is the most reliable place to see all current request and response schemas including full enum value lists.

---

## Testing the API

### Postman Collection

A ready-to-import collection is at `postman/PED-Aerial-API.postman_collection.json`. A companion environment file is at `postman/PED-Aerial-Local.postman_environment.json`.

Import both files into Postman (or Insomnia) and select the "PED-Aerial-Local" environment. The environment defines `baseUrl` as `http://localhost:8081`. After calling the login endpoint, copy the `token` value from the response and set it as the `jwt` environment variable -- subsequent requests use `Authorization: Bearer {{jwt}}` automatically.

The collection covers: authentication, job requests, jobs, missions, documents, inspection reports, invoices, and payments.

### curl Examples

**Login and capture token:**

```bash
curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pilot@example.com","password":"securepass123"}'
```

**Get current user:**

```bash
curl -s http://localhost:8081/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**List jobs:**

```bash
curl -s http://localhost:8081/api/jobs \
  -H "Authorization: Bearer <token>"
```

**Upload a document:**

```bash
curl -X POST http://localhost:8081/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./photo.jpg" \
  -F "jobId=<jobId>" \
  -F "category=AERIAL_PHOTO" \
  -F "isDeliverable=false"
```

---

## Out-of-Scope Findings

Observations from reading controllers and DTOs -- not fixed, only listed.

1. **`GET /api/service-catalog/active` requires authentication.** The SecurityConfig rule is `.requestMatchers("/api/service-catalog/active").authenticated()` -- not `permitAll`. Any unauthenticated request to the active catalog returns 401. This may be intentional (service data is not public), but it means new users cannot browse services before registering.

2. **`JobController.acceptJob()` and `JobController.updateStatus()` may be redundant.** `PATCH /api/jobs/{id}/accept` sets the job to accepted via a dedicated endpoint; `PATCH /api/jobs/{id}/status` with `{"status":"ACCEPTED"}` may achieve the same result. Whether `acceptJob` enforces additional preconditions requires reading `JobService` -- outside this phase's scope.

3. **`DashboardController` routes ADMIN to pilot dashboard.** The `else` branch in `getDashboard()` handles both PILOT and ADMIN by calling `getPilotDashboard(userId)`. There is no ADMIN-specific aggregate view across all users. ADMIN sees the pilot-perspective stats for their own user record, not platform-wide totals.

4. **`DocumentController.upload()` returns 200 not 201.** The upload endpoint returns `ResponseEntity.ok(...)` rather than `ResponseEntity.created(...)`. By convention a create operation should return 201; this is a minor API consistency issue.

5. **`ClientController.createClient()` returns 200 not 201.** Same pattern as the document upload: `ResponseEntity.ok(...)` instead of `ResponseEntity.created(...)`.

6. **`/api/clients/**` falls to catch-all `authenticated`.** The SecurityConfig does not have an explicit rule for `/api/clients/**`, so it falls to the final `authenticated` catch-all. The service layer enforces that only the creating pilot can read or modify client records -- but a COMPANY or CLIENT user with a valid JWT could call these endpoints and would receive a 404 or service-layer error rather than a 403 at the filter layer.

7. **`/api/profile/**` also falls to catch-all `authenticated`.** No explicit SecurityConfig rule; behavior is correct because the controller only exposes `/me` endpoints, but a future controller method added without care could be inadvertently exposed.

8. **`InvoiceStatusUpdateRequest` and `JobStatusUpdateRequest` are one-field records.** Both are thin wrappers. This is consistent with the DTO pattern but worth noting if a future status transition requires additional payload fields.
