INSERT INTO users (id, email, password_hash, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'demo@pedaerial.com',
    '$2a$10$DowdyPlaceholderHashForScaffoldOnly1234567890abcd',
    'USER'
)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO drone_profiles (
    id, user_id, name, type, wind_green_mph, wind_yellow_mph, gust_green_mph, gust_yellow_mph,
    precip_green_pct, precip_yellow_pct
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'DJI Air 3',
    'Prosumer',
    12, 18, 16, 24, 15, 35
)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO spots (id, user_id, label, address, lat, lon, notes, favorite)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Demo Launch Spot',
    'Newport Beach, CA',
    33.618900,
    -117.929800,
    'Scaffolded demo data',
    TRUE
)
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO spot_checks (id, spot_id, user_id, profile_id, date, status, summary, notes)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE,
    'GREEN',
    'Conditions are favorable for a short demo flight.',
    'Seed record for local setup.'
)
ON DUPLICATE KEY UPDATE status = VALUES(status);
