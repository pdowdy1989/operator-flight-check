# API Design

## Overview

The backend follows a REST-style design with JSON request and response bodies. Authentication is stateless and uses bearer tokens. Validation errors and missing-resource errors are normalized by a global exception handler.

## API Conventions

- Base path: `/api`
- Auth: `Authorization: Bearer <jwt>`
- Content type: `application/json`
- Success status codes:
  - `200 OK` for reads and updates
  - `201 Created` for creates
  - `204 No Content` for deletes
- Error status codes:
  - `400 Bad Request` for validation errors
  - `401 Unauthorized` for missing or invalid authentication
  - `403 Forbidden` for role failures
  - `404 Not Found` for missing resources

## Resource Groups

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Drone Profiles

- `GET /api/drone-profiles`
- `POST /api/drone-profiles`
- `PUT /api/drone-profiles/{id}`
- `DELETE /api/drone-profiles/{id}`

### Saved Spots

- `GET /api/spots`
- `POST /api/spots`
- `GET /api/spots/{id}`
- `PUT /api/spots/{id}`
- `DELETE /api/spots/{id}`

### Spot Checks

- `GET /api/spot-checks`
- `POST /api/spot-checks`
- `DELETE /api/spot-checks/{id}`

### Client Portal and Admin

- The application also includes client-facing token access flows and admin-protected routes under `/api/admin/**`.

## Validation and Error Handling

- DTOs use Bean Validation annotations such as `@Valid`, `@NotNull`, and field constraints.
- Missing entities raise a typed exception handled centrally by `GlobalExceptionHandler`.
- Authentication failures are processed through Spring Security filters before controller execution.

## Documentation and Testing

- Swagger/OpenAPI annotations describe the REST surface for interactive review.
- The Postman collection in `postman/` covers the main auth and CRUD flows with environment variables and scripted assertions.
