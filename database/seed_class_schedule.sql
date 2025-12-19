-- Seed thời khóa biểu cho khóa học
-- Tạo lịch học ảo cho học viên student@example.com

-- Lấy ID của khóa học đầu tiên và học viên student@example.com
DO $$
DECLARE
    v_course_id INTEGER;
    v_student_id INTEGER;
BEGIN
    -- Lấy ID khóa học đầu tiên có teacher
    SELECT id INTO v_course_id FROM khoa_hoc WHERE teacher_id IS NOT NULL LIMIT 1;
    
    -- Lấy ID học viên student@example.com
    SELECT id INTO v_student_id FROM users WHERE email = 'student@example.com' AND role = 'student';
    
    -- Nếu có khóa học và học viên, tạo enrollment và thời khóa biểu
    IF v_course_id IS NOT NULL AND v_student_id IS NOT NULL THEN
        -- Đảm bảo học viên đã đăng ký khóa học (kiểm tra trước khi insert)
        IF NOT EXISTS (
            SELECT 1 FROM dang_ky_khoa_hoc 
            WHERE user_id = v_student_id AND khoa_hoc_id = v_course_id
        ) THEN
            INSERT INTO dang_ky_khoa_hoc (user_id, khoa_hoc_id, trang_thai, ngay_dang_ky)
            VALUES (v_student_id, v_course_id, 'active', NOW());
        END IF;
        
        -- Tạo thời khóa biểu cho khóa học
        -- Buổi 1: Hôm nay + 2 ngày, 19:00-21:00
        INSERT INTO thoi_khoa_bieu (
            khoa_hoc_id, 
            tieu_de, 
            mo_ta, 
            ngay_hoc, 
            thoi_gian_bat_dau, 
            thoi_gian_ket_thuc, 
            link_google_meet,
            ghi_chu,
            is_completed,
            created_at,
            updated_at
        ) VALUES (
            v_course_id,
            'Buổi 1: Giới thiệu khóa học',
            'Buổi học đầu tiên - Giới thiệu tổng quan về khóa học, mục tiêu học tập và cách học hiệu quả.',
            NOW() + INTERVAL '2 days' + INTERVAL '19 hours',
            '19:00',
            '21:00',
            'https://meet.google.com/abc-defg-hij',
            'Học viên vui lòng chuẩn bị máy tính và kết nối internet ổn định.',
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        -- Buổi 2: Hôm nay + 5 ngày, 19:00-21:00
        INSERT INTO thoi_khoa_bieu (
            khoa_hoc_id, 
            tieu_de, 
            mo_ta, 
            ngay_hoc, 
            thoi_gian_bat_dau, 
            thoi_gian_ket_thuc, 
            link_google_meet,
            ghi_chu,
            is_completed,
            created_at,
            updated_at
        ) VALUES (
            v_course_id,
            'Buổi 2: Làm quen với công cụ',
            'Học cách sử dụng các công cụ và môi trường phát triển.',
            NOW() + INTERVAL '5 days' + INTERVAL '19 hours',
            '19:00',
            '21:00',
            'https://meet.google.com/abc-defg-hij',
            'Cài đặt phần mềm trước khi vào lớp.',
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        -- Buổi 3: Hôm nay + 9 ngày, 19:00-21:00
        INSERT INTO thoi_khoa_bieu (
            khoa_hoc_id, 
            tieu_de, 
            mo_ta, 
            ngay_hoc, 
            thoi_gian_bat_dau, 
            thoi_gian_ket_thuc, 
            link_google_meet,
            ghi_chu,
            is_completed,
            created_at,
            updated_at
        ) VALUES (
            v_course_id,
            'Buổi 3: Thực hành bài tập',
            'Thực hành các bài tập cơ bản và giải đáp thắc mắc.',
            NOW() + INTERVAL '9 days' + INTERVAL '19 hours',
            '19:00',
            '21:00',
            'https://meet.google.com/abc-defg-hij',
            'Hoàn thành bài tập trước khi vào lớp.',
            false,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Đã tạo thời khóa biểu cho khóa học ID: %, học viên ID: %', v_course_id, v_student_id;
    ELSE
        RAISE NOTICE 'Không tìm thấy khóa học hoặc học viên student@example.com';
    END IF;
END $$;

-- Kiểm tra kết quả
SELECT 
    tkb.id,
    tkb.tieu_de,
    tkb.ngay_hoc,
    tkb.thoi_gian_bat_dau,
    tkb.thoi_gian_ket_thuc,
    tkb.link_google_meet,
    kh.tieu_de as khoa_hoc,
    u.email as hoc_vien
FROM thoi_khoa_bieu tkb
JOIN khoa_hoc kh ON tkb.khoa_hoc_id = kh.id
LEFT JOIN dang_ky_khoa_hoc e ON e.khoa_hoc_id = kh.id
LEFT JOIN users u ON e.user_id = u.id AND u.email = 'student@example.com'
ORDER BY tkb.ngay_hoc;

