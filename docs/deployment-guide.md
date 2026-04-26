# Deployment Guide -- PED AERIAL (Operator Flight Check)

This guide covers three operational modes for the PED AERIAL platform: local development (the primary use case), local demonstration with seed data, and deployment to generic cloud infrastructure (an optional future path). The AWS Deployment and DevOps category was removed from the project rubric by the instructor due to cost constraints; no live AWS deployment currently exists or is claimed. The `buildspec.yml` file at the repo root is a leftover artifact from an earlier planning phase and is not wired to any pipeline.

The application is a three-tier system: a React 18 single-page application served by Vite on port 5173 (development) or any static host (production), a Spring Boot 3.5 REST API running on port 8081, and a MySQL 8 database whose schema is managed exclusively by Flyway migrations (V1 through V4). File uploads are stored on local disk at `./uploads`. Payment integration uses Stripe in test mode with a graceful mock fallback when keys are absent. See `docs/architecture-diagram.md` for system diagrams and the full authorization rule matrix.

---

## Operational Modes

1. **Local Development** -- developer machine, local MySQL database, Vite dev server with hot reload. The everyday workflow for writing and testing the application. Covered in Section 3.

2. **Local Demo** -- same stack but with the `demo` Spring profile activated, which seeds representative users, jobs, missions, and documents for grading demonstrations. Covered in Section 4.

3. **Test Execution** -- H2 in-memory database via the `local` Spring profile; no MySQL required. Covered in Section 5.

4. **Generic Cloud Deployment (Optional)** -- guidance on deploying to any VM or container host with a managed MySQL instance. AWS is used as an illustrative example only. Covered in Section 6.

---

## Local Development

### Prerequisites

Before starting, confirm the following are installed:

- Java 17 or 21: `java -version` -- should report 17.x or 21.x
- Maven 3.8+: `mvn -version`
- Node.js 18+: `node -v`
- MySQL 8.0+ running locally on port 3306 (or accessible via JDBC URL)
- Git

### Database Preparation

Create an empty database before the first backend start:

```sql
CREATE DATABASE operator_flight_check CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Important:** Do NOT run any SQL schema files manually. Flyway applies migrations V1 through V4 automatically the first time the backend starts. Manually applying SQL before Flyway runs will corrupt the migration state.

If you are using a non-root MySQL user, grant privileges:

```sql
GRANT ALL PRIVILEGES ON operator_flight_check.* TO 'youruser'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Setup

```bash
cd backend
```

**Option A -- environment variables (recommended):**

```bash
export DB_URL="jdbc:mysql://localhost:3306/operator_flight_check"
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET="a-long-random-base64-or-ASCII-string-at-least-32-chars"
export APP_SECURITY_ALLOWED_ORIGINS="http://localhost:5173"

# Optional -- leave unset to use defaults or mock behavior
export STRIPE_SECRET_KEY=""
export STRIPE_WEBHOOK_SECRET=""
export OPENWEATHER_API_KEY=""
```

**Option B -- local.properties file (git-ignored):**

Create `backend/local.properties` (this path is imported automatically by `application.properties`):

```
DB_URL=jdbc:mysql://localhost:3306/operator_flight_check
DB_USERNAME=root
DB_PASSWORD=yourpassword
JWT_SECRET=a-long-random-base64-or-ASCII-string-at-least-32-chars
APP_SECURITY_ALLOWED_ORIGINS=http://localhost:5173
```

**Build and run:**

```bash
mvn clean install
mvn spring-boot:run
```

Flyway applies V1 through V4 on first start. Startup takes 5-15 seconds. Confirm success:

```bash
curl http://localhost:8081/api/health
```

Expected response:

```json
{ "status": "UP", "service": "operator-flight-check-backend", "timestamp": "..." }
```

### Frontend Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8081/api" > .env
npm run dev
```

Open `http://localhost:5173` in the browser. The Vite dev server proxies are not configured -- the frontend calls the backend directly at the URL in `VITE_API_URL`.

### Environment Variables Reference

All variables read by the backend are listed in `backend/src/main/resources/application.properties`. The table below shows each variable, whether it is required, the default if omitted, and its purpose.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DB_URL` | No | `jdbc:mysql://localhost:3306/operator_flight_check` | MySQL JDBC connection URL |
| `DB_USERNAME` | No | `root` | MySQL username |
| `DB_PASSWORD` | No | `root` | MySQL password |
| `JWT_SECRET` | Yes | none | HS256 signing key for JWTs; application will not start if missing |
| `APP_SECURITY_ALLOWED_ORIGINS` | No | `http://localhost:5173,http://127.0.0.1:5173` | CORS allowed origins; comma-separate multiple values |
| `APP_SECURITY_AUTH_RATE_LIMIT_MAX_REQUESTS` | No | `10` | Max auth requests per rate-limit window |
| `APP_SECURITY_AUTH_RATE_LIMIT_WINDOW_SECONDS` | No | `60` | Rate-limit window in seconds |
| `OPENWEATHER_API_KEY` | No | (empty) | Present in config but unused by any backend service; Open-Meteo is called browser-direct |
| `STRIPE_SECRET_KEY` | No | (empty) | Stripe secret key; mock checkout returned if absent |
| `STRIPE_WEBHOOK_SECRET` | No | (empty) | Stripe webhook signing secret for `POST /api/payments/webhook` |
| `STRIPE_SUCCESS_URL` | No | `http://localhost:5173/payment/success` | Redirect after successful Stripe payment |
| `STRIPE_CANCEL_URL` | No | `http://localhost:5173/payment/cancel` | Redirect after cancelled Stripe payment |
| `APP_PDF_OUTPUT_DIR` | No | `./uploads/pdfs` | Directory for generated invoice and agreement PDFs |
| `app.upload.dir` | No | `./uploads` | Directory for uploaded documents |
| `VITE_API_URL` | Yes (frontend) | none | Backend API base URL; set in `frontend/.env` |

### Troubleshooting

- **Flyway migration fails on startup** -- the most common cause is a schema that was partially set up by a prior manual SQL run. Inspect the Flyway output (logged to console at WARN/ERROR level). If the schema is in an inconsistent state, drop and recreate the database and let Flyway run clean.

- **`JWT_SECRET` missing or blank** -- the application will refuse to start with an error from `JwtService`. Set the environment variable to any string of at least 32 characters.

- **CORS errors in the browser** -- verify `APP_SECURITY_ALLOWED_ORIGINS` includes the exact origin the frontend is serving from (including port). The default covers `http://localhost:5173` and `http://127.0.0.1:5173`.

- **Port 8081 already in use** -- kill the process using port 8081 (`lsof -i :8081` on macOS/Linux, `netstat -ano | findstr :8081` on Windows) or change `server.port` in `application.properties`.

- **MySQL authentication failure** -- confirm the MySQL user exists, has the correct password, and has `GRANT ALL` on the `operator_flight_check` database. Check that `DB_USERNAME` and `DB_PASSWORD` environment variables match the MySQL credentials.

- **H2 console not available** -- the H2 console at `/h2-console` is only enabled when the `local` Spring profile is active. It is not available in the default (MySQL) profile.

- **Stripe webhook not firing locally** -- the webhook endpoint requires an internet-accessible URL. For local development, use the Stripe CLI (`stripe listen --forward-to localhost:8081/api/payments/webhook`) or a tunnel tool. Without webhooks, invoice status does not transition to `PAID` automatically; update it manually via `PATCH /api/invoices/{id}/status`.

---

## Local Demo Mode

The `demo` Spring profile activates `DemoDataConfig`, which seeds a complete set of demonstration data on first startup: four user accounts, two drones, multiple clients, five jobs across different types and statuses, missions, inspection reports, invoices, payments, and placeholder document files.

### Activating the Demo Profile

```bash
cd backend
export SPRING_PROFILES_ACTIVE=demo
export JWT_SECRET="demo-secret-key-at-least-32-chars-long"
mvn spring-boot:run
```

The demo profile uses a separate database by default (`operator_flight_check_demo` with `createDatabaseIfNotExist=true`). No manual database creation is required for the demo database.

The demo profile still requires a running MySQL instance. It does not use H2.

### Demo Accounts

All demo accounts use the password `Password123`.

| Email | Password | Role | Name | Notes |
|---|---|---|---|---|
| pilot@pedaerial.com | Password123 | PILOT | Marcus Reed (Reed Aerial Solutions) | Primary pilot account; has jobs, missions, invoices, and drones seeded |
| client@pedaerial.com | Password123 | CLIENT | Sarah Johnson (Johnson Real Estate Group) | Client with a real estate job and a construction mapping job |
| insurance@pedaerial.com | Password123 | COMPANY | David Carter (Apex Claims and Adjusting) | Insurance company user; storm and flood inspection claims linked |
| company@pedaerial.com | Password123 | COMPANY | David Carter (Apex Claims and Adjusting) | Alternate COMPANY login; same identity as insurance account |

**Warning:** Do NOT activate the `demo` profile in a production environment. It seeds plaintext-equivalent credentials and test data that should never appear in a production database.

### What the Demo Seeds

- Two DJI drones (Mavic 3 Pro and Air 2S) linked to the pilot account
- Three clients in the pilot's directory
- Five jobs covering real estate photography, roof inspection, construction mapping, storm insurance inspection, and flood insurance inspection
- Five missions with weather data and fly scores
- Two inspection reports (one SUBMITTED, one APPROVED)
- Two invoices (one PAID, one SENT)
- Placeholder document files written to `./uploads/demo/`

### Stripe in Demo Mode

If no `STRIPE_SECRET_KEY` is configured, checkout sessions return a mock URL that redirects to `STRIPE_SUCCESS_URL?mock=true`. For a demo that needs to show the payment flow with a real Stripe-hosted page, set `STRIPE_SECRET_KEY` to a Stripe test-mode secret key (starts with `sk_test_`). Use only Stripe test card numbers (e.g., `4242 4242 4242 4242`, any future expiry, any CVC).

---

## Testing and Code Quality

### Running the Test Suite

Tests use H2 in-memory via the `local` Spring profile. No MySQL instance is required.

```bash
cd backend
mvn clean test
```

Current status: 54 tests, 0 failures, 0 errors, 0 skipped.

### Coverage Report

```bash
cd backend
mvn clean test jacoco:report
```

Report is generated at `backend/target/site/jacoco/index.html`. Open in a browser. Current baseline coverage:

| Metric | Value |
|---|---|
| Line coverage | 30.6% |
| Instruction coverage | 27.8% |
| Branch coverage | 17.7% |

Security package coverage is the strongest at 88.0% line coverage. Service and controller coverage is lower. Phase 3 of the project roadmap targets 70%+ backend coverage. See `docs/code-coverage-report.md` for the full per-package breakdown and gap analysis.

### SonarQube Static Analysis

A `docker-compose.sonarqube.yml` is included at the repo root for running a local SonarQube instance. For cloud analysis via SonarCloud, see `docs/sonarqube-analysis.md` for token configuration and the scan command. The Maven plugin is configured in `pom.xml` with the SonarCloud `pdowdy1989_operator-flight-check` project key.

### Postman Collection

`postman/PED-Aerial-API.postman_collection.json` covers auth and major CRUD flows. Import the collection and the companion `postman/PED-Aerial-Local.postman_environment.json` into Postman. Set the environment to "PED-Aerial-Local". Run the Login request first to populate the `jwt` environment variable, then run subsequent requests.

---

## Generic Cloud Deployment (Optional)

No cloud deployment currently exists. This section documents what a production-grade deployment would look like if the project were to be hosted publicly. AWS is used as an illustrative example; the same topology applies to GCP, Azure, Fly.io, Railway, Render, or any provider that offers VM or container hosting and a managed MySQL instance.

### Build Artifacts

**Backend:**

```bash
cd backend
mvn clean package -DskipTests
```

Produces `backend/target/operator-flight-check-0.0.1-SNAPSHOT.jar`. This is a self-contained Spring Boot executable jar.

**Frontend:**

```bash
cd frontend
npm ci
VITE_API_URL=https://api.yourproductiondomain.com/api npm run build
```

Produces `frontend/dist/`. The `dist/` folder contains the compiled static assets and a root `index.html`. Deploy the full contents of `dist/` to a static host.

### Target Topology (Provider-Agnostic)

| Component | What to Use |
|---|---|
| Frontend | Any static host -- S3 + CloudFront, Netlify, Vercel, Cloudflare Pages, Nginx, Apache |
| Backend | Any Java 17 runtime -- Docker on a VPS, AWS EC2 or ECS, GCP Cloud Run, Azure App Service, Fly.io, Railway |
| Database | Any managed MySQL 8 instance -- AWS RDS, GCP Cloud SQL, PlanetScale, managed VPS |
| Secrets | Any secret manager -- AWS SSM Parameter Store, GCP Secret Manager, HashiCorp Vault, Doppler, or plain environment variables injected at deploy time |
| File storage | **Local disk `./uploads` (current implementation).** For any multi-instance deployment this must be replaced with shared object storage (S3, GCS, Azure Blob). See Known Limitations. |
| Payments | Point `STRIPE_WEBHOOK_URL` at `https://api.yourproductiondomain.com/api/payments/webhook`. For local testing, use `stripe listen --forward-to localhost:8081/api/payments/webhook` (Stripe CLI) |

### Production Environment Variables

The same variables documented in Section 3 apply in production. Replace localhost URLs with production hostnames.

| Variable | Required | Notes |
|---|---|---|
| `DB_URL` | Yes | Production JDBC URL (e.g., `jdbc:mysql://rds-host:3306/operator_flight_check`) |
| `DB_USERNAME` | Yes | Production database user |
| `DB_PASSWORD` | Yes | Production database password; inject via secret manager |
| `JWT_SECRET` | Yes | Strong random string; rotate periodically |
| `APP_SECURITY_ALLOWED_ORIGINS` | Yes | Production frontend origin (e.g., `https://app.yourproductiondomain.com`) |
| `APP_SECURITY_AUTH_RATE_LIMIT_MAX_REQUESTS` | No | Tune for expected auth volume |
| `APP_SECURITY_AUTH_RATE_LIMIT_WINDOW_SECONDS` | No | Default 60 seconds |
| `STRIPE_SECRET_KEY` | Yes | Live-mode Stripe key (starts with `sk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | From Stripe Dashboard webhook endpoint configuration |
| `STRIPE_SUCCESS_URL` | Yes | Production payment success page URL |
| `STRIPE_CANCEL_URL` | Yes | Production payment cancel page URL |
| `APP_PDF_OUTPUT_DIR` | No | Path to PDF output directory; ensure writable by the app process |
| `app.upload.dir` | No | Path to document upload directory; ensure writable by the app process |

### Schema Migrations in Production

Flyway applies migrations automatically on backend startup. The application.properties setting `spring.jpa.hibernate.ddl-auto=validate` means Hibernate will fail fast if the entity model and live schema diverge. There is no manual schema step to run.

To apply migrations against a fresh production database, simply start the application with the correct `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` pointing to an empty MySQL database. Flyway runs V1 through V4 in sequence on the first boot.

### Running the Backend in Production

```bash
java -jar backend/target/operator-flight-check-0.0.1-SNAPSHOT.jar \
  --server.port=8081 \
  --spring.profiles.active=mysql
```

Pass secrets as environment variables or JVM system properties (`-D`). The `mysql` profile activates `application-mysql.properties`, which reads from the same environment variables as the default profile but also sets `createDatabaseIfNotExist=true` on the JDBC URL.

### AWS as a Reference Topology (Illustrative Only)

One possible AWS layout: serve the `dist/` folder from S3 with a CloudFront distribution in front; run the Spring Boot jar on EC2 (t3.micro or t3.small); use RDS MySQL 8 on a db.t3.micro in a private subnet; inject secrets via AWS SSM Parameter Store or Secrets Manager as environment variables in the EC2 user data or launch template. Automated deployments could be wired through GitHub Actions or CodePipeline to the CodeBuild spec already present at `buildspec.yml`. Note that `buildspec.yml` builds both the backend jar and the frontend dist but contains no deploy steps -- it was not wired to a CodeDeploy or S3 sync step before development was paused.

No step-by-step AWS provisioning instructions are provided here, as the AWS Deployment category was removed from the rubric and no live deployment has been executed.

---

## Rollback and Disaster Recovery

- **Database rollback** -- Flyway migrations are forward-only. To reverse a schema change, write a new migration script (e.g., `V5__revert_column_change.sql`) and restart the application. Never edit or delete an already-applied migration script -- Flyway will detect the checksum mismatch and refuse to start.

- **Application rollback** -- keep the last two backend jars accessible. To roll back, redeploy the previous jar and restart the service. No schema change is needed unless the new migration scripts have already been applied, in which case a compensating migration is required.

- **Frontend rollback** -- redeploy the previous `dist/` build to the static host. Frontend rollback does not affect the database.

- **Secrets rotation** -- update the secret value in the environment or secret manager, then restart the backend. JWT tokens signed with the old secret will become invalid on the next validation; users will need to log in again.

- **File upload rollback** -- the local `./uploads` directory is not versioned. For production, use object-store versioning (S3 versioning, GCS versioning) so individual file versions can be restored. Rolling back the application does not automatically restore files.

- **Stripe webhook replay** -- if the webhook endpoint was temporarily down when a `checkout.session.completed` event fired, use the Stripe Dashboard (Developers -> Webhooks -> Event log) to replay the event. The `POST /api/payments/webhook` handler is idempotent for duplicate events on the same invoice.

- **Provider backups** -- for managed MySQL instances (RDS, Cloud SQL, etc.), automated daily backups are standard. Test restoration periodically. For local development, use `mysqldump operator_flight_check > backup.sql` as needed.

---

## Known Limitations

The following are genuine limitations of the current implementation. They are listed here transparently so graders and reviewers understand the scope of the capstone and what would be required to move toward a production-grade system.

- **Local disk file storage does not scale horizontally.** Any deployment with more than one backend instance will produce file-not-found errors for documents uploaded to a different instance. Replacing `./uploads` with S3 or another object store is the correct fix for production. Estimated effort: medium (1-3 days, primarily in `DocumentService` and `PdfGenerationService`).

- **No CI/CD pipeline is connected.** `buildspec.yml` exists in the repo root and compiles the backend and frontend correctly, but it is not wired to a CodePipeline, GitHub Actions, or any automated deploy step. Setting up a pipeline to build, test, and deploy on push to main would be straightforward.

- **No container image is published.** A simple `Dockerfile` for the Spring Boot jar (e.g., using `eclipse-temurin:17-jre`) would make cloud deployment significantly easier and is straightforward future work.

- **JWT token refresh is not implemented.** Tokens expire after 8 hours and require re-login. A short-lived access token plus refresh token rotation scheme would be appropriate for a production system.

- **ADMIN dashboard shows pilot view.** The `DashboardController` routes ADMIN users to `getPilotDashboard()`. There is no ADMIN-specific aggregate view across all platform users.

- **`/uploads/**` is publicly accessible without authentication.** Any user who obtains or guesses a document file path can download it without a JWT. In production, document download URLs should be time-limited pre-signed URLs from an object store rather than direct static paths.

- **No email notification system.** Job request status changes, acceptance events, and payment confirmations are not emailed to participants. All notifications are in-app via dashboard state polling.

- **`WeatherPage.jsx` is a legacy route.** A standalone weather forecast page from the original product version remains registered as a route (`/weather`) in the React frontend but is not linked from any role dashboard. It is a functional remnant that does not fit the insurance inspection product framing.

---

## Reference Links

- [README](../README.md)
- [Project Proposal](./project-proposal.md)
- [System Architecture](./architecture-diagram.md)
- [ERD](./erd.md)
- [API Design](./api-design.md)
- [Code Coverage Report](./code-coverage-report.md)
- [SonarQube Analysis](./sonarqube-analysis.md)
