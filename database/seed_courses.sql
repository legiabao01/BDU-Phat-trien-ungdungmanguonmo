-- Seed data for courses (khoa_hoc)
-- Run: psql -U elearn -d elearning -f database/seed_courses.sql

INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, hinh_anh, gia, gia_goc, so_buoi, thoi_luong, hinh_thuc, trang_thai, teacher_id, created_at, updated_at) VALUES
('Lập trình Web với Flask', 'Khóa học lập trình web cơ bản với Flask framework', 'beginner', 'https://example.com/flask.jpg', 1000000, 1200000, 10, '20h', 'online', 'active', 1, NOW(), NOW()),
('Python Nâng cao', 'Khóa học Python cho người đã có kiến thức cơ bản', 'intermediate', 'https://example.com/python.jpg', 1500000, 1800000, 12, '30h', 'online', 'active', 1, NOW(), NOW()),
('FastAPI và PostgreSQL', 'Xây dựng API với FastAPI và PostgreSQL', 'advanced', 'https://example.com/fastapi.jpg', 2000000, 2500000, 15, '40h', 'online', 'active', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed data for course content (chi_tiet_khoa_hoc) - Lessons
-- Assuming course_id 1, 2, 3 exist (adjust based on your actual IDs)

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, hinh_anh, video_path, video_duration, thu_tu, is_unlocked, unlock_date, created_at) VALUES
(1, 'Giới thiệu Flask', 'Bài học đầu tiên về Flask framework', NULL, 'https://www.youtube.com/watch?v=example1', 600, 1, true, NULL, NOW()),
(1, 'Routing và Views', 'Học cách tạo routes và views trong Flask', NULL, 'https://www.youtube.com/watch?v=example2', 900, 2, true, NULL, NOW()),
(1, 'Template Engine', 'Sử dụng Jinja2 template trong Flask', NULL, 'https://www.youtube.com/watch?v=example3', 1200, 3, false, NOW() + INTERVAL '7 days', NOW()),
(2, 'Decorators trong Python', 'Tìm hiểu về decorators', NULL, NULL, 0, 1, true, NULL, NOW()),
(2, 'Generators và Iterators', 'Làm việc với generators và iterators', NULL, NULL, 0, 2, true, NULL, NOW()),
(3, 'Giới thiệu FastAPI', 'Tổng quan về FastAPI framework', NULL, 'https://www.youtube.com/watch?v=example4', 800, 1, true, NULL, NOW()),
(3, 'Database với SQLAlchemy', 'Kết nối và làm việc với PostgreSQL', NULL, 'https://www.youtube.com/watch?v=example5', 1500, 2, true, NULL, NOW())
ON CONFLICT DO NOTHING;

