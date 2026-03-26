CREATE DATABASE IF NOT EXISTS operator_flight_check;
USE operator_flight_check;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS drone_profiles (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(100),
    type VARCHAR(50),
    wind_green_mph INT,
    wind_yellow_mph INT,
    gust_green_mph INT,
    gust_yellow_mph INT,
    precip_green_pct INT,
    precip_yellow_pct INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drone_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_drone_profiles_user_id ON drone_profiles (user_id);

CREATE TABLE IF NOT EXISTS spots (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    label VARCHAR(200),
    address VARCHAR(500) NOT NULL,
    lat DECIMAL(10, 6),
    lon DECIMAL(10, 6),
    notes TEXT,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_spots_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_spots_user_id ON spots (user_id);

CREATE TABLE IF NOT EXISTS spot_checks (
    id CHAR(36) PRIMARY KEY,
    spot_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    profile_id CHAR(36),
    date DATE NOT NULL,
    status VARCHAR(20),
    summary TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_spot_checks_spot
        FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
    CONSTRAINT fk_spot_checks_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_spot_checks_profile
        FOREIGN KEY (profile_id) REFERENCES drone_profiles(id)
);

CREATE INDEX idx_spot_checks_spot_id ON spot_checks (spot_id);
CREATE INDEX idx_spot_checks_user_id ON spot_checks (user_id);
