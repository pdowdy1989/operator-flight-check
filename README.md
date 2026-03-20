# 🚁 Operator Flight Check — PED AERIAL

[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20S3-orange?logo=amazonaws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> A drone flyability forecast web application that helps drone pilots make safe, informed go/no-go flight decisions based on real-time weather data.

---

## 🎯 Problem

Drone pilots currently rely on scattered weather apps and personal judgment to decide if conditions are safe to fly. There is no single tool that combines weather data with aircraft-specific thresholds and provides a clear go/no-go recommendation. Bad weather decisions lead to crashed drones, FAA violations, and safety incidents.

## 💡 Solution

**Operator Flight Check** lets pilots search any location, select their drone profile, and instantly get a 7-day color-coded flyability forecast (Green / Yellow / Red) with a 0–100 Fly Score. Pilots can save favorite spots, log flight decisions, and build a history of conditions at their preferred locations.

---

## ✨ Features

- **7-Day Flyability Forecast** — Color-coded Green/Yellow/Red assessment per day
- **Fly Score (0–100)** — Composite score factoring wind, gusts, precipitation, and severe weather
- **Drone Profiles** — Customizable thresholds for Micro, Prosumer, and Heavy aircraft
- **Location Search** — Search by name or use GPS geolocation
- **Saved Spots** — Bookmark favorite flight locations
- **Spot Check Logging** — Record go/no-go decisions with notes
- **Role-Based Access** — USER and ADMIN roles with JWT authentication
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React (S3)    │────▶│ Spring Boot (EC2) │────▶│  MySQL (RDS)    │
│   Vite + Router │◀────│  REST API + JWT   │◀────│  Private Subnet │
└─────────────────┘     └────────┬───────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌───────────┐ ┌─────────┐ ┌──────────┐
             │OpenWeather│ │Nominatim│ │SSM Params│
             │  Map API  │ │Geocoder │ │ (Secrets)│
             └───────────┘ └─────────┘ └──────────┘
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, React Router v6, Axios, Tailwind CSS |
| Backend    | Java 17, Spring Boot 3, Spring Data JPA, Spring Security |
| Database   | MySQL 8.0                                       |
| Auth       | JWT (jjwt 0.11.5), BCrypt                      |
| APIs       | OpenWeatherMap (forecast), Nominatim (geocoding)|
| Cloud      | AWS EC2, RDS, S3, CodePipeline, CloudWatch      |
| Testing    | JUnit 5, Mockito, Postman, JaCoCo, SonarQube   |
| CI/CD      | AWS CodePipeline + CodeBuild + CodeDeploy       |

---

## 📁 Project Structure

```
operator-flight-check/
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/pedaerial/operatorflightcheck/
│   │   │   │   ├── config/        # Security, CORS, JWT config
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── dto/           # Request/Response DTOs
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── exception/     # Custom exceptions + handler
│   │   │   │   ├── repository/    # Spring Data JPA repos
│   │   │   │   ├── security/      # JWT filter, UserDetailsService
│   │   │   │   └── service/       # Business logic
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/
│   │   │           ├── schema.sql
│   │   │           └── seed-data.sql
│   │   └── test/                  # JUnit + integration tests
│   └── pom.xml
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── context/               # AuthContext, ThemeContext
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Route-level components
│   │   ├── services/              # API call modules
│   │   └── utils/                 # Scoring logic, formatters
│   ├── package.json
│   └── vite.config.js
├── scripts/                    # Deployment scripts
├── docs/                       # Documentation
│   ├── architecture-diagram.md
│   ├── erd.md
│   ├── api-design.md
│   └── adrs/                     # Architecture Decision Records
├── buildspec.yml               # AWS CodeBuild
├── appspec.yml                 # AWS CodeDeploy
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+
- OpenWeatherMap API key ([get one free](https://openweathermap.org/api))

### Backend Setup

```bash
cd backend

# Set environment variables (or create application-local.properties)
export DB_URL=jdbc:mysql://localhost:3306/operator_flight_check
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-256-bit-secret
export OPENWEATHER_API_KEY=your-api-key

# Run the database schema
mysql -u root -p < src/main/resources/db/schema.sql
mysql -u root -p operator_flight_check < src/main/resources/db/seed-data.sql

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will be available at `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080/api" > .env
echo "VITE_OWM_API_KEY=your-api-key" >> .env

# Run dev server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🔑 Environment Variables

| Variable              | Description                    | Where Used |
|-----------------------|--------------------------------|------------|
| `DB_URL`              | MySQL JDBC connection string   | Backend    |
| `DB_USERNAME`         | MySQL username                 | Backend    |
| `DB_PASSWORD`         | MySQL password                 | Backend    |
| `JWT_SECRET`          | Secret key for signing JWTs    | Backend    |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key         | Backend    |
| `VITE_API_URL`        | Backend API base URL           | Frontend   |
| `VITE_OWM_API_KEY`    | OpenWeatherMap API key         | Frontend   |

---

## 📡 API Endpoints

| Method | Path                          | Description                | Auth Required |
|--------|-------------------------------|----------------------------|:------------:|
| POST   | `/api/auth/register`          | Register new user          | No           |
| POST   | `/api/auth/login`             | Login, receive JWT         | No           |
| GET    | `/api/auth/me`                | Get current user profile   | Yes          |
| GET    | `/api/spots`                  | List user's saved spots    | Yes          |
| POST   | `/api/spots`                  | Create a new spot          | Yes          |
| GET    | `/api/spots/{id}`             | Get spot by ID             | Yes          |
| PUT    | `/api/spots/{id}`             | Update a spot              | Yes          |
| DELETE | `/api/spots/{id}`             | Delete a spot              | Yes          |
| GET    | `/api/spot-checks`            | List spot checks           | Yes          |
| POST   | `/api/spot-checks`            | Log a new spot check       | Yes          |
| DELETE | `/api/spot-checks/{id}`       | Delete a spot check        | Yes          |
| GET    | `/api/drone-profiles`         | List user's drone profiles | Yes          |
| POST   | `/api/drone-profiles`         | Create a drone profile     | Yes          |
| PUT    | `/api/drone-profiles/{id}`    | Update a drone profile     | Yes          |
| DELETE | `/api/drone-profiles/{id}`    | Delete a drone profile     | Yes          |

---

## 🧪 Testing

```bash
# Run unit tests
cd backend
mvn test

# Generate coverage report
mvn jacoco:report
# Report at: target/site/jacoco/index.html

# Run SonarQube analysis (Docker required)
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000
```

---

## ☁️ Deployment

The application is deployed on AWS:

- **Frontend:** S3 static website hosting
- **Backend:** EC2 (t2.micro, Amazon Linux 2)
- **Database:** RDS MySQL 8.0 (db.t3.micro, private subnet)
- **CI/CD:** AWS CodePipeline → CodeBuild → CodeDeploy + S3 sync
- **Secrets:** SSM Parameter Store
- **Monitoring:** CloudWatch dashboards + alarms

See [docs/deployment-guide.md](docs/deployment-guide.md) for detailed instructions.

---

## 📄 Documentation

- [Project Proposal](docs/project-proposal.md)
- [Architecture Diagram](docs/architecture-diagram.md)
- [Entity-Relationship Diagram](docs/erd.md)
- [API Design Document](docs/api-design.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Architecture Decision Records](docs/adrs/)

---

## 👤 Author

**Phillip Dowdy**
UCI 2123 — Systems Engineering with AWS | Capstone Project

---

## 📝 License

This project is part of an academic capstone and is for educational purposes.
