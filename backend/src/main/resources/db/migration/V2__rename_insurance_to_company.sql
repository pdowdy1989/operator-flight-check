-- Rename role enum value INSURANCE → COMPANY
UPDATE users SET role = 'COMPANY' WHERE role = 'INSURANCE';

-- Rename client_type enum value INSURANCE_COMPANY → COMPANY
UPDATE clients SET client_type = 'COMPANY' WHERE client_type = 'INSURANCE_COMPANY';

-- If the columns are declared as ENUM types with explicit value lists,
-- alter them to match the new Java enum values:
ALTER TABLE users
  MODIFY COLUMN role VARCHAR(20) NOT NULL;

ALTER TABLE clients
  MODIFY COLUMN client_type VARCHAR(30) NOT NULL;
