-- Seed data cho khoa hoc lap trinh
-- Xoa du lieu cu (neu co)
TRUNCATE TABLE chi_tiet_khoa_hoc CASCADE;
TRUNCATE TABLE khoa_hoc CASCADE;

-- Reset sequence
ALTER SEQUENCE IF EXISTS khoa_hoc_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS chi_tiet_khoa_hoc_id_seq RESTART WITH 1;

-- Tao giao vien mau (neu chua co) - password: teacher123
-- Note: password_hash la hash cua "teacher123" - can generate lai neu can
INSERT INTO users (email, password_hash, ho_ten, role, so_dien_thoai)
VALUES 
    ('teacher1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5Z5Z5u', 'Nguyen Van Giang', 'teacher', '0901234567'),
    ('teacher2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5Z5Z5u', 'Tran Thi Code', 'teacher', '0901234568')
ON CONFLICT (email) DO NOTHING;

-- Khoa hoc 1: Python Co Ban
INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, hinh_anh, gia, gia_goc, so_buoi, thoi_luong, hinh_thuc, teacher_id, trang_thai)
VALUES (
    'Python Co Ban - Tu Zero den Hero',
    'Khoa hoc Python toan dien cho nguoi moi bat dau. Hoc tu cu phap co ban den xay dung ung dung thuc te. Bao gom: bien, ham, OOP, xu ly file, API, va nhieu hon nua.',
    'Beginner',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    1990000,
    2990000,
    20,
    '40 gio',
    'online',
    (SELECT id FROM users WHERE email = 'teacher1@example.com' LIMIT 1),
    'active'
);

-- Bai hoc cho Python Co Ban
INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT 
    id,
    'Gioi thieu Python va Cai dat',
    'Tim hieu ve Python, lich su phat trien, va cach cai dat moi truong phat trien.',
    1,
    'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    true,
    NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Bien va Kieu Du Lieu', 'Hoc ve cac kieu du lieu co ban: so, chuoi, boolean, list, tuple, dictionary.', 2, 'https://www.youtube.com/watch?v=khKv-8q7YmY', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Cau Lenh Dieu Kien va Vong Lap', 'If/else, for, while loops va cach su dung hieu qua.', 3, 'https://www.youtube.com/watch?v=OnDr4J2UXSA', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Ham va Module', 'Cach tao va su dung ham, import module, va to chuc code.', 4, 'https://www.youtube.com/watch?v=NSbOtYzIQI0', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Lap Trinh Huong Doi Tuong (OOP)', 'Class, Object, Inheritance, Polymorphism trong Python.', 5, 'https://www.youtube.com/watch?v=JeznW_7DlB0', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Xu Ly File va Exception', 'Doc/ghi file, xu ly loi voi try/except.', 6, NULL, true, NOW() + INTERVAL '1 day'
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Lam Viec voi Database', 'Ket noi va thao tac voi SQLite, MySQL bang Python.', 7, NULL, false, NOW() + INTERVAL '2 days'
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Xay Dung API voi Flask', 'Tao RESTful API don gian voi Flask framework.', 8, NULL, false, NOW() + INTERVAL '3 days'
FROM khoa_hoc WHERE tieu_de LIKE 'Python Co Ban%';

-- Khoa hoc 2: JavaScript Full Stack
INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, hinh_anh, gia, gia_goc, so_buoi, thoi_luong, hinh_thuc, teacher_id, trang_thai)
VALUES (
    'JavaScript Full Stack - React & Node.js',
    'Khoa hoc JavaScript toan dien tu frontend den backend. Hoc React, Node.js, Express, MongoDB. Xay dung ung dung web hoan chinh.',
    'Intermediate',
    'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    2990000,
    3990000,
    25,
    '50 gio',
    'online',
    (SELECT id FROM users WHERE email = 'teacher2@example.com' LIMIT 1),
    'active'
);

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'JavaScript ES6+ Co Ban', 'Arrow functions, destructuring, spread operator, promises.', 1, 'https://www.youtube.com/watch?v=NCwa_xi0Uuc', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'JavaScript Full Stack%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'DOM Manipulation va Events', 'Thao tac voi DOM, xu ly events, tao tuong tac.', 2, 'https://www.youtube.com/watch?v=0ik6X4DJKCc', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'JavaScript Full Stack%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'React Co Ban', 'Components, Props, State, Hooks (useState, useEffect).', 3, 'https://www.youtube.com/watch?v=DLX62G4lc44', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'JavaScript Full Stack%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'React Router va State Management', 'Dieu huong voi React Router, quan ly state voi Context API.', 4, NULL, true, NOW() + INTERVAL '1 day'
FROM khoa_hoc WHERE tieu_de LIKE 'JavaScript Full Stack%';

-- Khoa hoc 3: Web Development
INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, hinh_anh, gia, gia_goc, so_buoi, thoi_luong, hinh_thuc, teacher_id, trang_thai)
VALUES (
    'Web Development Co Ban - HTML, CSS, JavaScript',
    'Khoa hoc web development cho nguoi moi bat dau. Hoc HTML5, CSS3, JavaScript tu co ban den nang cao. Xay dung website responsive va tuong tac.',
    'Beginner',
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
    1490000,
    1990000,
    15,
    '30 gio',
    'online',
    (SELECT id FROM users WHERE email = 'teacher1@example.com' LIMIT 1),
    'active'
);

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'HTML5 Co Ban', 'Cau truc HTML, semantic tags, forms, tables.', 1, 'https://www.youtube.com/watch?v=UB1O30fR-EE', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Web Development Co Ban%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'CSS3 Styling', 'Selectors, box model, flexbox, grid layout.', 2, 'https://www.youtube.com/watch?v=yfoY53QXEnI', true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Web Development Co Ban%';

-- Khoa hoc 4: Data Science
INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, hinh_anh, gia, gia_goc, so_buoi, thoi_luong, hinh_thuc, teacher_id, trang_thai)
VALUES (
    'Data Science voi Python - Pandas, NumPy, Matplotlib',
    'Khoa hoc phan tich du lieu voi Python. Hoc Pandas de xu ly data, NumPy cho tinh toan, Matplotlib de visualize. Thuc hanh voi dataset thuc te.',
    'Advanced',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    3990000,
    4990000,
    30,
    '60 gio',
    'online',
    (SELECT id FROM users WHERE email = 'teacher2@example.com' LIMIT 1),
    'active'
);

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'Gioi thieu Data Science', 'Tong quan ve Data Science, cac cong cu va thu vien.', 1, NULL, true, NOW()
FROM khoa_hoc WHERE tieu_de LIKE 'Data Science%';

INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu, video_path, is_unlocked, unlock_date)
SELECT id, 'NumPy - Tinh Toan So Hoc', 'Arrays, operations, broadcasting, linear algebra.', 2, NULL, true, NOW() + INTERVAL '1 day'
FROM khoa_hoc WHERE tieu_de LIKE 'Data Science%';



