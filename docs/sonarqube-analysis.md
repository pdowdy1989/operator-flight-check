# SonarQube Cloud Analysis

## Why these files were added

This repo already had JaCoCo configured and a short README note about SonarQube, but it did not have:

- pinned SonarQube Cloud Maven configuration
- a documented run flow for generating coverage and publishing analysis
- project-level properties for the imported SonarQube Cloud project

These additions make task 47 reproducible for the next person who opens the project.

## Project configuration

- `sonar.organization=pdowdy1989`
- `sonar.host.url=https://sonarcloud.io`
- `sonar.projectKey=pdowdy1989_operator-flight-check`

Coverage and Surefire report paths are already wired through the backend Maven build, so a single Maven command can run tests, produce coverage, and publish the scan.

## Local setup

1. Create a SonarQube Cloud user token.

2. Set the token in your shell:

   ```powershell
   $env:SONAR_TOKEN="your-token"
   ```

3. Run the backend scan:

   ```powershell
   cd backend
   mvn clean verify sonar:sonar -Dsonar.token=$env:SONAR_TOKEN
   ```

4. Review the dashboard in SonarQube Cloud:

   `https://sonarcloud.io/project/overview?id=pdowdy1989_operator-flight-check`

## Pre-scan cleanup completed

Before running SonarQube, the following likely code-smell candidates were cleaned up:

- `JwtService` now catches the narrower `IllegalArgumentException` when a JWT secret is not valid Base64.
- `AuthRateLimitFilter` now uses a clearer `shouldNotFilter` condition for auth versus non-auth requests.

These are small changes, but they reduce noise in static analysis and make the intent of the code easier to follow.

## Current execution status

The project is now configured for SonarQube Cloud and does not require Docker on the local machine.

The full remote scan was not executed from this environment because it requires a valid user token that should stay private to the account owner.

That means:

- project setup is complete
- backend verification still ran through Maven tests
- the actual Sonar dashboard results will appear after the token-backed Maven command above is run from a developer shell or CI environment

## What to review after the first scan

Focus on these Sonar categories first:

- `Critical` and `Major` issues in `backend/src/main/java`
- security hotspots around auth, JWT handling, and seeded demo credentials
- maintainability issues in filters and exception handling
- coverage gaps in any newly added service or controller logic
