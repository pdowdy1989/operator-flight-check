# Project Proposal

## Problem Statement

Drone pilots often have to switch between weather apps, personal notes, and aircraft manuals to decide whether a flight is safe. That fragmented workflow increases the chance of poor go/no-go decisions, damaged equipment, and avoidable safety incidents.

## Proposed Solution

Operator Flight Check is a full-stack web application that combines forecast data, geocoding, drone-specific thresholds, and pilot history into a single workflow. The system gives pilots a clear flyability recommendation, helps them save preferred spots, and records operational decisions for future reference.

## Target Users

- Recreational drone pilots who want a quick go/no-go recommendation.
- Part 107 operators who need more consistent flight planning.
- Team leads or admins who manage multiple users and need secure access controls.

## User Stories

1. As a pilot, I want to register an account so my saved locations and drone profiles persist across sessions.
2. As a returning user, I want to log in securely so I can access protected planning features.
3. As a pilot, I want to create multiple drone profiles so each aircraft can use its own wind and precipitation thresholds.
4. As a pilot, I want to search for a location by name so I can check unfamiliar flying areas.
5. As a pilot, I want to use GPS coordinates so I can evaluate conditions at my current position.
6. As a pilot, I want to view a seven-day forecast so I can choose the safest day to fly.
7. As a pilot, I want a color-coded recommendation and numeric score so I can interpret risk quickly.
8. As a pilot, I want to save favorite spots so I can revisit frequent launch locations without re-entering them.
9. As a pilot, I want to log spot checks with notes so I can track operational decisions over time.
10. As a pilot, I want to review my history so I can compare actual decisions with forecast conditions.
11. As an admin, I want role-based access controls so privileged endpoints are protected from normal users.
12. As a user, I want the app to work on mobile and desktop so I can check conditions in the field.

## Functional Requirements

- Users must be able to register, authenticate, and access protected resources with JWT-based sessions.
- Users must be able to create, update, view, and delete drone profiles.
- Users must be able to create, update, view, and delete saved spots.
- Users must be able to request weather-based flyability results for a searched or saved location.
- The system must calculate a flyability score using configurable drone thresholds.
- The UI must display a seven-day forecast with clear green/yellow/red status states.
- Users must be able to create and view spot-check history entries with notes.
- The API must validate request bodies and return structured error responses.
- Admin-only routes must require the `ADMIN` role.
- The system must expose API documentation for local testing and review.

## Non-Functional Requirements

- The application should return forecast and CRUD responses with low latency suitable for interactive use.
- The frontend should be responsive across mobile, tablet, and desktop screen sizes.
- Sensitive endpoints should use stateless authentication, password hashing, and request validation.
- Production secrets should be supplied through environment variables or a secrets manager.
- The codebase should be modular, using separated controller, service, repository, and component layers.
- The project should be testable with automated unit tests and API collection checks.
- The system should fail safely when required configuration, such as API keys or JWT secrets, is missing.

## Scope

### In Scope

- Secure authentication and authorization
- Weather forecast retrieval and scoring
- Drone profile management
- Saved spot management
- Spot-check logging and history
- Responsive React frontend
- Spring Boot REST API
- Relational persistence with MySQL-compatible schema

### Out of Scope

- Real-time drone telemetry ingestion
- FAA LAANC authorization workflows
- Native iOS or Android applications
- Offline-first synchronization
- Multi-tenant enterprise account management
- Payment processing or subscription billing

## Success Criteria

- A pilot can log in, select a drone profile, search a location, and receive a flight recommendation in one session.
- The application persists users, spots, profiles, and spot checks correctly in the database.
- Protected routes reject unauthorized access and admin endpoints enforce role checks.
- The system is documented clearly enough for a reviewer to run locally and understand the architecture.
