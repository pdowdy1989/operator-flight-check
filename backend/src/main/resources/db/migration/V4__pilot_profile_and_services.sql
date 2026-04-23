-- ============================================================
-- V4: Pilot Profile, Availability, and Services
--   1. Create pilot_profiles table
--   2. Create pilot_services table
--   3. Create weekly_schedules table
--   4. Create availability_exceptions table
--   5. Add category column to service_catalog
--   6. Swap job_request_line_items FK: service_catalog_id → pilot_service_id
--      Add pricing_type_snapshot column
--   7. Seed 20 service_catalog entries
-- ============================================================

-- ---- 1. pilot_profiles --------------------------------------

CREATE TABLE IF NOT EXISTS pilot_profiles (
    id                  CHAR(36)     PRIMARY KEY,
    pilot_id            CHAR(36)     NOT NULL UNIQUE,
    bio                 TEXT         NULL,
    profile_photo_path  VARCHAR(500) NULL,
    years_experience    INT          NULL,
    certifications      TEXT         NULL,
    accepting_jobs      BIT          NOT NULL DEFAULT b'1',
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'pilot_profiles' AND index_name = 'idx_pilot_profiles_pilot_id'),
        'SELECT 1',
        'CREATE INDEX idx_pilot_profiles_pilot_id ON pilot_profiles(pilot_id)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---- 2. pilot_services --------------------------------------

CREATE TABLE IF NOT EXISTS pilot_services (
    id                          CHAR(36)       PRIMARY KEY,
    pilot_id                    CHAR(36)       NOT NULL,
    catalog_service_id          CHAR(36)       NULL,
    custom_name                 VARCHAR(200)   NULL,
    custom_description          TEXT           NULL,
    job_type                    VARCHAR(30)    NOT NULL,
    pricing_type                VARCHAR(10)    NOT NULL,
    flat_fee                    DECIMAL(10,2)  NULL,
    hourly_rate                 DECIMAL(10,2)  NULL,
    estimated_duration_minutes  INT            NULL,
    active                      BIT            NOT NULL DEFAULT b'1',
    sort_order                  INT            NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id)           REFERENCES users(id)           ON DELETE CASCADE,
    FOREIGN KEY (catalog_service_id) REFERENCES service_catalog(id) ON DELETE SET NULL
);

SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'pilot_services' AND index_name = 'idx_pilot_services_pilot_id'),
        'SELECT 1',
        'CREATE INDEX idx_pilot_services_pilot_id ON pilot_services(pilot_id)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'pilot_services' AND index_name = 'idx_pilot_services_active'),
        'SELECT 1',
        'CREATE INDEX idx_pilot_services_active ON pilot_services(active)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---- 3. weekly_schedules ------------------------------------

CREATE TABLE IF NOT EXISTS weekly_schedules (
    id          CHAR(36)    PRIMARY KEY,
    pilot_id    CHAR(36)    NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'weekly_schedules' AND index_name = 'idx_weekly_schedules_pilot_id'),
        'SELECT 1',
        'CREATE INDEX idx_weekly_schedules_pilot_id ON weekly_schedules(pilot_id)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---- 4. availability_exceptions -----------------------------

CREATE TABLE IF NOT EXISTS availability_exceptions (
    id              CHAR(36)     PRIMARY KEY,
    pilot_id        CHAR(36)     NOT NULL,
    exception_date  DATE         NOT NULL,
    exception_type  VARCHAR(10)  NOT NULL,
    start_time      TIME         NULL,
    end_time        TIME         NULL,
    reason          VARCHAR(500) NULL,
    FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'availability_exceptions' AND index_name = 'idx_avail_exc_pilot_id'),
        'SELECT 1',
        'CREATE INDEX idx_avail_exc_pilot_id ON availability_exceptions(pilot_id)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'availability_exceptions' AND index_name = 'idx_avail_exc_date'),
        'SELECT 1',
        'CREATE INDEX idx_avail_exc_date ON availability_exceptions(exception_date)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---- 5. Add category to service_catalog ---------------------

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'service_catalog'
      AND COLUMN_NAME = 'category'
);
SET @stmt = IF(@col_exists = 0,
    'ALTER TABLE service_catalog ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT ''OTHER''',
    'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---- 6. Swap job_request_line_items FK ----------------------

-- Drop existing FK constraint on service_catalog_id (auto-named by MySQL)
SET @fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'job_request_line_items'
      AND COLUMN_NAME = 'service_catalog_id'
      AND REFERENCED_TABLE_NAME = 'service_catalog'
    LIMIT 1
);
SET @stmt = IF(@fk_name IS NOT NULL,
    CONCAT('ALTER TABLE job_request_line_items DROP FOREIGN KEY `', @fk_name, '`'),
    'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop the old column (only if it still exists)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'job_request_line_items'
      AND COLUMN_NAME = 'service_catalog_id'
);
SET @stmt = IF(@col_exists > 0,
    'ALTER TABLE job_request_line_items DROP COLUMN service_catalog_id',
    'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add pilot_service_id column (table is confirmed empty — R3)
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'job_request_line_items'
      AND COLUMN_NAME = 'pilot_service_id'
);
SET @stmt = IF(@col_exists = 0,
    'ALTER TABLE job_request_line_items ADD COLUMN pilot_service_id CHAR(36) NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add pricing_type_snapshot column
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'job_request_line_items'
      AND COLUMN_NAME = 'pricing_type_snapshot'
);
SET @stmt = IF(@col_exists = 0,
    'ALTER TABLE job_request_line_items ADD COLUMN pricing_type_snapshot VARCHAR(10) NOT NULL DEFAULT ''FLAT''',
    'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK for pilot_service_id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'job_request_line_items'
      AND CONSTRAINT_NAME = 'fk_jrli_pilot_service'
);
SET @stmt = IF(@fk_exists = 0,
    'ALTER TABLE job_request_line_items ADD CONSTRAINT fk_jrli_pilot_service FOREIGN KEY (pilot_service_id) REFERENCES pilot_services(id) ON DELETE RESTRICT',
    'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for pilot_service_id
SET @stmt = (
    SELECT IF(
        EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'job_request_line_items' AND index_name = 'idx_jrli_pilot_service_id'),
        'SELECT 1',
        'CREATE INDEX idx_jrli_pilot_service_id ON job_request_line_items(pilot_service_id)'
    )
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---- 7. Seed 20 service_catalog entries ---------------------
-- Flyway guarantees this migration runs exactly once; plain INSERT is correct.

INSERT INTO service_catalog
    (id, job_type, name, description, base_price, estimated_duration_minutes, active, sort_order, category, created_at, updated_at)
VALUES
-- INSPECTION (5)
(UUID(), 'INSURANCE_INSPECTION',  'Insurance Roof Inspection',         'Aerial roof inspection for insurance claims and assessments.',                    275.00,  60,  b'1', 10,  'INSPECTION',    NOW(), NOW()),
(UUID(), 'INSURANCE_INSPECTION',  'Property Damage Assessment',        'Comprehensive aerial property damage documentation.',                             350.00,  90,  b'1', 20,  'INSPECTION',    NOW(), NOW()),
(UUID(), 'INSURANCE_INSPECTION',  'Insurance Claims Inspection',       'Full aerial documentation package for insurance claim processing.',               325.00,  75,  b'1', 30,  'INSPECTION',    NOW(), NOW()),
(UUID(), 'THERMAL_INSPECTION',    'Thermal / Infrared Inspection',     'Thermal imaging inspection for heat loss, leaks, and anomalies.',                 450.00,  90,  b'1', 40,  'INSPECTION',    NOW(), NOW()),
(UUID(), 'ROOF_SURVEY',           'Commercial Roof Survey',            'Detailed aerial roof survey for commercial properties.',                          500.00, 120,  b'1', 50,  'INSPECTION',    NOW(), NOW()),
-- AERIAL_MEDIA (4)
(UUID(), 'AERIAL_PHOTOGRAPHY',    'Aerial Photography Package',        'High-resolution aerial still photography package.',                               400.00,  90,  b'1', 60,  'AERIAL_MEDIA',  NOW(), NOW()),
(UUID(), 'AERIAL_VIDEOGRAPHY',    'Aerial Videography Package',        'Cinematic aerial video footage package.',                                         500.00, 120,  b'1', 70,  'AERIAL_MEDIA',  NOW(), NOW()),
(UUID(), 'AERIAL_PHOTOGRAPHY',    'Aerial Photo + Video Combo',        'Combined aerial photography and videography package.',                            750.00, 150,  b'1', 80,  'AERIAL_MEDIA',  NOW(), NOW()),
(UUID(), 'EVENT_COVERAGE',        'Event Aerial Coverage',             'Live event aerial coverage and documentation.',                                   200.00, 120,  b'1', 90,  'AERIAL_MEDIA',  NOW(), NOW()),
-- MAPPING_SURVEY (3)
(UUID(), 'SURVEYING_ORTHOMOSAIC', 'Orthomosaic Mapping',               'High-accuracy 2D orthomosaic map generation from aerial data.',                   800.00, 180,  b'1', 100, 'MAPPING_SURVEY', NOW(), NOW()),
(UUID(), 'SURVEYING_3D_MODEL',    '3D Model / Point Cloud Survey',     'Photogrammetric 3D model and point cloud generation.',                           1000.00, 240,  b'1', 110, 'MAPPING_SURVEY', NOW(), NOW()),
(UUID(), 'MAPPING',               'Site Progress Map',                 'Aerial progress mapping for construction or development sites.',                   600.00, 150,  b'1', 120, 'MAPPING_SURVEY', NOW(), NOW()),
-- REAL_ESTATE (3)
(UUID(), 'REAL_ESTATE',           'Real Estate Listing Photos',        'Aerial photography for MLS and property listing use.',                            350.00,  60,  b'1', 130, 'REAL_ESTATE',   NOW(), NOW()),
(UUID(), 'REAL_ESTATE',           'Real Estate Listing Video',         'Cinematic aerial video for property marketing and listings.',                     450.00,  90,  b'1', 140, 'REAL_ESTATE',   NOW(), NOW()),
(UUID(), 'REAL_ESTATE',           'Real Estate Marketing Package',     'Full aerial photo and video package for real estate marketing.',                  700.00, 120,  b'1', 150, 'REAL_ESTATE',   NOW(), NOW()),
-- CONSTRUCTION (2)
(UUID(), 'CONSTRUCTION',          'Construction Progress Monitoring',  'Aerial progress documentation for active construction projects.',                 400.00,  90,  b'1', 160, 'CONSTRUCTION',  NOW(), NOW()),
(UUID(), 'CONSTRUCTION',          'Construction Site Survey',          'Detailed aerial site survey for pre-build planning and reporting.',               550.00, 120,  b'1', 170, 'CONSTRUCTION',  NOW(), NOW()),
-- OTHER (3)
(UUID(), 'SOLAR_PANEL_INSPECTION','Solar Panel Inspection',            'Thermal and visual aerial inspection of solar array installations.',              375.00,  60,  b'1', 180, 'OTHER',         NOW(), NOW()),
(UUID(), 'CELL_TOWER_INSPECTION', 'Cell Tower Inspection',             'Aerial visual inspection of cellular and communication towers.',                  500.00,  90,  b'1', 190, 'OTHER',         NOW(), NOW()),
(UUID(), 'OTHER',                 'Custom Drone Service',              'Custom aerial service - scope and pricing as agreed.',                            150.00, NULL,  b'1', 200, 'OTHER',         NOW(), NOW());
