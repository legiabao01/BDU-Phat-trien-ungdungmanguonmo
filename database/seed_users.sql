-- Seed users cho testing
-- Password hash cho "admin123", "teacher123", "student123"

-- Admin account
INSERT INTO users (email, password_hash, ho_ten, role, so_dien_thoai, is_active)
VALUES (
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5Z5Z5u', -- password: admin123
    'Admin User',
    'admin',
    '0900000001',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Teacher accounts (đã có trong seed_programming_courses_fixed_utf8.sql)
-- teacher1@example.com / teacher123
-- teacher2@example.com / teacher123

-- Student accounts
INSERT INTO users (email, password_hash, ho_ten, role, so_dien_thoai, is_active)
VALUES 
    ('student@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5Z5Z5u', 'Student Test', 'student', '0900000002', true),
    ('student1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5Z5Z5u', 'Nguyen Van A', 'student', '0900000003', true),
    ('student2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5Z5Z5u', 'Tran Thi B', 'student', '0900000004', true)
ON CONFLICT (email) DO NOTHING;

