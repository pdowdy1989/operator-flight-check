# Entity Relationship Diagram

## ERD

```mermaid
erDiagram
    USERS ||--o{ DRONE_PROFILES : owns
    USERS ||--o{ SPOTS : saves
    USERS ||--o{ SPOT_CHECKS : logs
    SPOTS ||--o{ SPOT_CHECKS : records
    DRONE_PROFILES ||--o{ SPOT_CHECKS : references

    USERS {
        char_36 id PK
        varchar email UK
        varchar password_hash
        enum role
        timestamp created_at
    }

    DRONE_PROFILES {
        char_36 id PK
        char_36 user_id FK
        varchar name
        varchar type
        int wind_green_mph
        int wind_yellow_mph
        int gust_green_mph
        int gust_yellow_mph
        int precip_green_pct
        int precip_yellow_pct
        timestamp created_at
    }

    SPOTS {
        char_36 id PK
        char_36 user_id FK
        varchar label
        varchar address
        decimal lat
        decimal lon
        text notes
        boolean favorite
        timestamp created_at
    }

    SPOT_CHECKS {
        char_36 id PK
        char_36 spot_id FK
        char_36 user_id FK
        char_36 profile_id FK
        date date
        varchar status
        text summary
        text notes
        timestamp created_at
    }
```

## Design Notes

- `users` is the parent entity for authentication and ownership.
- `drone_profiles` stores per-aircraft safety thresholds used during scoring.
- `spots` stores reusable launch locations for each user.
- `spot_checks` ties a user, an optional drone profile, and a chosen spot to a dated operational decision.
- Foreign keys on `spot_checks` preserve referential integrity, and `spot_id` cascades on delete to remove orphaned history when a spot is intentionally deleted.
