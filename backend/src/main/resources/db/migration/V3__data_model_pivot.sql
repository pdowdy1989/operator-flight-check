-- ============================================================
-- V3: Data model pivot
--   1. Expand users with business/billing profile fields
--   2. Add flat insurance-claim fields to jobs
--   3. Migrate existing insurance_details rows into jobs
--   4. Drop insurance_details table
--   5. Create service_catalog table
--   6. Create job_requests table
--   7. Create job_request_line_items table
--   8. Create agreements table
-- ============================================================

-- ---- 1. Expand users ----------------------------------------

ALTER TABLE users
    ADD COLUMN business_name       VARCHAR(255)  NULL,
    ADD COLUMN ein                 VARCHAR(50)   NULL,
    ADD COLUMN llc_verified        BIT           NOT NULL DEFAULT b'0',
    ADD COLUMN payment_terms       VARCHAR(20)   NULL,
    ADD COLUMN billing_address     VARCHAR(500)  NULL,
    ADD COLUMN billing_city        VARCHAR(100)  NULL,
    ADD COLUMN billing_state       VARCHAR(50)   NULL,
    ADD COLUMN billing_zip         VARCHAR(20)   NULL,
    ADD COLUMN insurance_policy_number  VARCHAR(100) NULL,
    ADD COLUMN insurance_company_name   VARCHAR(255) NULL;

-- ---- 2. Add flat insurance-claim fields to jobs --------------

ALTER TABLE jobs
    ADD COLUMN claim_number           VARCHAR(100) NULL,
    ADD COLUMN policy_number          VARCHAR(100) NULL,
    ADD COLUMN insurance_company_name VARCHAR(255) NULL,
    ADD COLUMN adjuster_name          VARCHAR(255) NULL,
    ADD COLUMN adjuster_email         VARCHAR(255) NULL,
    ADD COLUMN adjuster_phone         VARCHAR(50)  NULL,
    ADD COLUMN loss_date              DATE         NULL,
    ADD COLUMN loss_type              VARCHAR(20)  NULL,
    ADD COLUMN property_type          VARCHAR(20)  NULL,
    ADD COLUMN inspection_scope       TEXT         NULL;

-- ---- 3. Migrate insurance_details → jobs --------------------

UPDATE jobs j
JOIN insurance_details id ON id.job_id = j.id
SET j.claim_number           = id.claim_number,
    j.policy_number          = id.policy_number,
    j.insurance_company_name = id.insurance_company,
    j.adjuster_name          = id.adjuster_name,
    j.adjuster_email         = id.adjuster_email,
    j.adjuster_phone         = id.adjuster_phone,
    j.loss_date              = id.loss_date,
    j.loss_type              = id.loss_type,
    j.property_type          = id.property_type,
    j.inspection_scope       = id.inspection_scope;

-- ---- 4. Drop insurance_details ------------------------------

DROP TABLE IF EXISTS insurance_details;

-- ---- 5. service_catalog -------------------------------------

CREATE TABLE IF NOT EXISTS service_catalog (
    id                          CHAR(36)       PRIMARY KEY,
    job_type                    VARCHAR(30)    NOT NULL,
    name                        VARCHAR(100)   NOT NULL,
    description                 TEXT           NULL,
    base_price                  DECIMAL(10,2)  NOT NULL,
    estimated_duration_minutes  INT            NULL,
    active                      BIT            NOT NULL DEFAULT b'1',
    sort_order                  INT            NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_catalog_job_type ON service_catalog(job_type);
CREATE INDEX IF NOT EXISTS idx_service_catalog_active   ON service_catalog(active);

-- ---- 6. job_requests ----------------------------------------

CREATE TABLE IF NOT EXISTS job_requests (
    id                    CHAR(36)        PRIMARY KEY,
    requester_id          CHAR(36)        NOT NULL,
    reviewed_by_pilot_id  CHAR(36)        NULL,
    status                VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    site_address          VARCHAR(500)    NOT NULL,
    site_lat              DECIMAL(10,6)   NULL,
    site_lon              DECIMAL(10,6)   NULL,
    requested_date        DATE            NULL,
    requested_time        TIME            NULL,
    is_recurring          BIT             NOT NULL DEFAULT b'0',
    recurrence_pattern    VARCHAR(100)    NULL,
    notes                 TEXT            NULL,
    rate_card_total       DECIMAL(10,2)   NOT NULL,
    discount_percent      DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    final_amount          DECIMAL(10,2)   NOT NULL,
    proposed_budget       DECIMAL(10,2)   NULL,
    claim_number          VARCHAR(100)    NULL,
    policy_number         VARCHAR(100)    NULL,
    insurance_company_name VARCHAR(255)   NULL,
    adjuster_name         VARCHAR(255)    NULL,
    adjuster_email        VARCHAR(255)    NULL,
    adjuster_phone        VARCHAR(50)     NULL,
    loss_date             DATE            NULL,
    loss_type             VARCHAR(20)     NULL,
    property_type         VARCHAR(20)     NULL,
    inspection_scope      TEXT            NULL,
    created_job_id        CHAR(36)        NULL,
    decided_at            TIMESTAMP       NULL,
    decision_notes        TEXT            NULL,
    created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id)         REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_pilot_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_job_id)       REFERENCES jobs(id)  ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_job_requests_requester_id ON job_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_status       ON job_requests(status);

-- ---- 7. job_request_line_items ------------------------------

CREATE TABLE IF NOT EXISTS job_request_line_items (
    id                      CHAR(36)       PRIMARY KEY,
    job_request_id          CHAR(36)       NOT NULL,
    service_catalog_id      CHAR(36)       NOT NULL,
    service_name_snapshot   VARCHAR(100)   NOT NULL,
    unit_price_snapshot     DECIMAL(10,2)  NOT NULL,
    quantity                INT            NOT NULL DEFAULT 1,
    amount                  DECIMAL(10,2)  NOT NULL,
    sort_order              INT            NOT NULL DEFAULT 0,
    FOREIGN KEY (job_request_id)     REFERENCES job_requests(id)    ON DELETE CASCADE,
    FOREIGN KEY (service_catalog_id) REFERENCES service_catalog(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_jrli_job_request_id ON job_request_line_items(job_request_id);

-- ---- 8. agreements ------------------------------------------

CREATE TABLE IF NOT EXISTS agreements (
    id               CHAR(36)      PRIMARY KEY,
    job_id           CHAR(36)      NOT NULL UNIQUE,
    agreement_number VARCHAR(50)   NOT NULL UNIQUE,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING_SIGNATURE',
    signed_at        TIMESTAMP     NULL,
    signed_by_name   VARCHAR(255)  NULL,
    signed_by_email  VARCHAR(255)  NULL,
    pdf_path         VARCHAR(500)  NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
