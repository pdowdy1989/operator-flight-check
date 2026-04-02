CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120),
    role VARCHAR(20) NOT NULL,
    plan VARCHAR(20) NOT NULL,
    team_name VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(100),
    phone VARCHAR(20),
    billing_address VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drone_profiles (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    max_wind_mph INT NOT NULL DEFAULT 15,
    max_gust_mph INT NOT NULL DEFAULT 22,
    max_precip_pct INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    client_id CHAR(36),
    drone_profile_id CHAR(36),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location_label VARCHAR(200),
    location_address VARCHAR(500),
    location_lat DECIMAL(10,6),
    location_lon DECIMAL(10,6),
    mission_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    fly_score INT,
    weather_summary TEXT,
    duration_hours DECIMAL(4,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    FOREIGN KEY (drone_profile_id) REFERENCES drone_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    invoice_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE(user_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS line_items (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,
    mission_id CHAR(36),
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(20) NOT NULL,
    reference_note VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deliverables (
    id CHAR(36) PRIMARY KEY,
    mission_id CHAR(36) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS client_portal_access (
    id CHAR(36) PRIMARY KEY,
    token VARCHAR(120) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    mission_id CHAR(36),
    invoice_id CHAR(36),
    expires_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_client_portal_access_token ON client_portal_access(token);
