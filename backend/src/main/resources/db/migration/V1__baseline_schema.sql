CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    company VARCHAR(255),
    license_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id CHAR(36) PRIMARY KEY,
    pilot_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    client_type VARCHAR(30) NOT NULL,
    address VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drone_profiles (
    id CHAR(36) PRIMARY KEY,
    pilot_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    faa_registration VARCHAR(50),
    weight_grams INT,
    max_wind_mph INT,
    max_gust_mph INT,
    notes TEXT,
    active BIT NOT NULL DEFAULT b'1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
    id CHAR(36) PRIMARY KEY,
    pilot_id CHAR(36),
    client_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(20),
    site_address VARCHAR(500) NOT NULL,
    site_lat DECIMAL(10,6),
    site_lon DECIMAL(10,6),
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration INT,
    actual_duration INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS insurance_details (
    id CHAR(36) PRIMARY KEY,
    job_id CHAR(36) NOT NULL UNIQUE,
    claim_number VARCHAR(100) NOT NULL,
    policy_number VARCHAR(100),
    insurance_company VARCHAR(255) NOT NULL,
    adjuster_name VARCHAR(255),
    adjuster_email VARCHAR(255),
    adjuster_phone VARCHAR(50),
    loss_date DATE,
    loss_type VARCHAR(20),
    property_type VARCHAR(20),
    inspection_scope TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS missions (
    id CHAR(36) PRIMARY KEY,
    job_id CHAR(36) NOT NULL,
    pilot_id CHAR(36) NOT NULL,
    drone_profile_id CHAR(36),
    flight_date DATE NOT NULL,
    flight_time TIME,
    duration_minutes INT,
    weather_temp_f DOUBLE,
    weather_wind_mph DOUBLE,
    weather_gust_mph DOUBLE,
    weather_conditions VARCHAR(100),
    weather_visibility VARCHAR(50),
    fly_score INT,
    status VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (drone_profile_id) REFERENCES drone_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inspection_reports (
    id CHAR(36) PRIMARY KEY,
    job_id CHAR(36) NOT NULL UNIQUE,
    pilot_id CHAR(36) NOT NULL,
    report_date DATE NOT NULL,
    property_condition VARCHAR(20) NOT NULL,
    damage_found BIT NOT NULL DEFAULT b'0',
    damage_summary TEXT,
    roof_condition VARCHAR(20),
    exterior_condition VARCHAR(20),
    additional_findings TEXT,
    recommendations TEXT,
    pilot_signature VARCHAR(255),
    status VARCHAR(20),
    reviewer_notes TEXT,
    reviewed_by CHAR(36),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id CHAR(36) PRIMARY KEY,
    job_id CHAR(36) NOT NULL UNIQUE,
    pilot_id CHAR(36) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20),
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS line_items (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS documents (
    id CHAR(36) PRIMARY KEY,
    job_id CHAR(36) NOT NULL,
    mission_id CHAR(36),
    uploaded_by CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    thumbnail_path VARCHAR(500),
    mime_type VARCHAR(100),
    description TEXT,
    tags VARCHAR(500),
    category VARCHAR(30) NOT NULL,
    is_deliverable BIT NOT NULL DEFAULT b'0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_pilot_id ON clients(pilot_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_drone_profiles_pilot_id ON drone_profiles(pilot_id);
CREATE INDEX IF NOT EXISTS idx_jobs_pilot_id ON jobs(pilot_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_missions_job_id ON missions(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_pilot_id ON invoices(pilot_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON documents(job_id);
