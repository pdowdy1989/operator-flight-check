# Deployment Guide

## Overview

This guide documents the intended AWS deployment topology for Operator Flight Check. It is written so the project can be reviewed, reproduced locally, or used as the basis for a future live deployment.

## Target Architecture

- Frontend hosted as a static React build in Amazon S3
- Backend packaged as a Spring Boot jar and deployed to Amazon EC2
- MySQL hosted in Amazon RDS
- Secrets provided through environment variables or AWS Systems Manager Parameter Store
- Monitoring handled through Amazon CloudWatch logs and alarms

## Prerequisites

- AWS account with permissions for EC2, RDS, S3, IAM, CloudWatch, and optionally CodeBuild
- Java 17, Maven, Node.js 18+, and MySQL client tools
- OpenWeatherMap API key
- A strong `JWT_SECRET` value supplied through environment configuration

## Backend Deployment Steps

1. Provision an EC2 instance running Amazon Linux 2023 or Amazon Linux 2.
2. Install Java 17 and Maven or copy a prebuilt jar.
3. Configure environment variables for:
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `OPENWEATHER_API_KEY`
   - `APP_SECURITY_ALLOWED_ORIGINS`
4. Ensure the local Spring profile is not enabled in production so demo seed data is skipped.
5. Build the backend with `mvn clean package`.
6. Upload the jar and run it behind a process manager such as `systemd`.
7. Open only the required inbound ports through the EC2 security group.

## Database Deployment Steps

1. Create an RDS MySQL instance in a private subnet.
2. Restrict database access to the backend EC2 security group.
3. Create the `operator_flight_check` schema.
4. Apply `backend/src/main/resources/db/schema.sql`.
5. Optionally apply `backend/src/main/resources/db/seed-data.sql` for local or demo environments only.

## Frontend Deployment Steps

1. Build the frontend with `npm install` and `npm run build`.
2. Set `VITE_API_URL` to the deployed backend API URL before building.
3. Upload the generated `dist/` assets to an S3 bucket configured for static hosting or behind CloudFront.
4. Configure bucket policy or CloudFront origin access as appropriate for the chosen hosting model.

## CI/CD Notes

- A minimal `buildspec.yml` is included at the repo root for AWS CodeBuild.
- A fuller pipeline could add CodePipeline for orchestration and CodeDeploy or EC2 user-data automation for backend rollout.

## Monitoring Recommendations

- Send Spring Boot application logs to CloudWatch Logs.
- Create alarms for EC2 CPU, instance health, and RDS free storage.
- Add a basic budget alert to cap free-tier or classroom usage.

## Security Notes

- Never rely on a hardcoded JWT secret in production.
- Do not enable the `local` Spring profile outside development.
- Scope CORS origins to the deployed frontend domain.
- Store database credentials and API keys outside the repository.
