INSERT INTO users (id, email, password_hash, name, role, plan, team_name, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'pilot@pedaerial.com', '$2a$10$HWaFsgNNZ7Map8rWgmWml.opNOIqGijhwycjl6gKkx6PokscjzwoW', 'Demo Pilot', 'USER', 'PRO', NULL, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'admin@pedaerial.com', '$2a$10$HWaFsgNNZ7Map8rWgmWml.opNOIqGijhwycjl6gKkx6PokscjzwoW', 'Demo Admin', 'ADMIN', 'TEAM', 'PED Aerial', CURRENT_TIMESTAMP);

INSERT INTO clients (id, user_id, name, email, company, phone, billing_address, notes, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Summit Real Estate', 'hello@summit.example', 'Summit Real Estate', '555-0101', '100 Main St, Columbus, OH', 'Luxury listing shoots', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Bridgeview Construction', 'ops@bridgeview.example', 'Bridgeview Construction', '555-0102', '220 River Rd, Columbus, OH', 'Progress documentation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Lakeside Events', 'booking@lakeside.example', 'Lakeside Events', '555-0103', '75 Lake Ave, Columbus, OH', 'Event promo flights', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO drone_profiles (id, user_id, name, type, max_wind_mph, max_gust_mph, max_precip_pct, created_at) VALUES
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'DJI Mini 3 Pro', 'MICRO', 18, 24, 20, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', 'DJI Mavic 3', 'PROSUMER', 24, 30, 25, CURRENT_TIMESTAMP);

INSERT INTO missions (id, user_id, client_id, drone_profile_id, title, description, location_label, location_address, location_lat, location_lon, mission_date, status, fly_score, weather_summary, duration_hours, notes, created_at, updated_at) VALUES
('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444442', 'Summit Listing Capture', 'Photo and video package', 'German Village', 'Columbus, OH', 39.947000, -82.998000, CURRENT_DATE - 5, 'COMPLETED', 88, 'Clear, light wind', 2.50, 'Delivered same day', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555552', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444442', 'Bridgeview Roof Progress', 'Weekly progress set', 'Westerville Site', 'Westerville, OH', 40.126000, -82.929000, CURRENT_DATE - 1, 'COMPLETED', 81, 'Cloudy but stable', 1.75, 'Roof framing complete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555553', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444441', 'Lakeside Promo Flight', 'Short-form promo content', 'Lakeside Park', 'Columbus, OH', 39.965000, -82.936000, CURRENT_DATE + 2, 'PLANNED', 76, 'Partly cloudy', 1.25, 'Need golden hour window', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555554', '11111111-1111-1111-1111-111111111111', NULL, '44444444-4444-4444-4444-444444444441', 'Practice Airspace Review', 'Solo skills session', 'Scioto Grove', 'Grove City, OH', 39.867000, -83.091000, CURRENT_DATE + 5, 'PLANNED', 82, 'Cool and calm', 1.00, 'No client attached', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, notes, created_at, updated_at) VALUES
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'INV-0001', 'SENT', CURRENT_DATE - 2, CURRENT_DATE + 12, 'Net 14', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'INV-0002', 'DRAFT', CURRENT_DATE, CURRENT_DATE + 15, 'Draft estimate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO line_items (id, invoice_id, mission_id, description, quantity, unit_price, amount, sort_order, created_at) VALUES
('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'Aerial photo package', 1.00, 350.00, 350.00, 0, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'Edited vertical clips', 1.00, 150.00, 150.00, 1, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555552', 'Weekly progress flight', 1.00, 275.00, 275.00, 0, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666662', NULL, 'Editing and annotations', 1.00, 125.00, 125.00, 1, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777775', '66666666-6666-6666-6666-666666666662', NULL, 'Travel fee', 1.00, 60.00, 60.00, 2, CURRENT_TIMESTAMP);

INSERT INTO payments (id, invoice_id, amount, payment_date, method, reference_note, created_at) VALUES
('88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', 200.00, CURRENT_DATE - 1, 'BANK_TRANSFER', 'Deposit', CURRENT_TIMESTAMP);
