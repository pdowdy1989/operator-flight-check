# Architecture Diagram

## System Context

```mermaid
flowchart LR
    Pilot[Drone Pilot]
    Frontend[React Frontend<br/>Vite + React Router]
    Backend[Spring Boot API<br/>Security + Business Logic]
    Database[(MySQL / RDS)]
    Weather[OpenWeatherMap API]
    Geocoder[Nominatim Geocoding]
    Secrets[Environment Variables / SSM]
    Hosting[S3 + EC2]

    Pilot -->|Uses browser or mobile web| Frontend
    Frontend -->|HTTPS JSON requests| Backend
    Backend -->|JPA persistence| Database
    Backend -->|Forecast lookup| Weather
    Frontend -->|Location search| Geocoder
    Secrets -->|JWT secret, DB creds, API keys| Backend
    Hosting --> Frontend
    Hosting --> Backend
```

## Data Flow Notes

- The React frontend handles routing, authenticated navigation, and forecast presentation.
- The Spring Boot backend validates requests, applies business rules, and issues JWTs.
- MySQL stores users, drone profiles, saved spots, and spot-check history.
- OpenWeatherMap provides weather inputs used for flyability scoring.
- Nominatim resolves human-readable place searches into coordinates.
- Deployment can map the frontend to S3 static hosting and the API to EC2, with secrets injected via environment variables or AWS Systems Manager Parameter Store.
