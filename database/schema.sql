-- Database Schema cho Ứng dụng Học Trực Tuyến
-- MySQL Database

CREATE DATABASE IF NOT EXISTS webhoctructuyen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webhoctructuyen;

-- Bảng Users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20),
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Khoa Hoc (Khóa học)
CREATE TABLE IF NOT EXISTS khoa_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tieu_de VARCHAR(200) NOT NULL,
    mo_ta TEXT,
    cap_do VARCHAR(50),
    hinh_anh VARCHAR(255),
    gia DECIMAL(10, 2) DEFAULT 0,
    gia_goc DECIMAL(10, 2),
    so_buoi INT DEFAULT 0,
    thoi_luong VARCHAR(50),
    hinh_thuc ENUM('online', 'offline', 'hybrid') DEFAULT 'online',
    danh_gia_trung_binh DECIMAL(3, 2) DEFAULT 0,
    so_luong_danh_gia INT DEFAULT 0,
    trang_thai ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Chi Tiet Khoa Hoc (Chi tiết khóa học)
CREATE TABLE IF NOT EXISTS chi_tiet_khoa_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_hoc_id INT NOT NULL,
    tieu_de_muc VARCHAR(200) NOT NULL,
    noi_dung TEXT,
    hinh_anh VARCHAR(255),
    video_path VARCHAR(500),
    video_duration INT DEFAULT 0,
    thu_tu INT DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT TRUE,
    unlock_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Dang Ky Khoa Hoc (Đăng ký khóa học)
CREATE TABLE IF NOT EXISTS dang_ky_khoa_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    khoa_hoc_id INT NOT NULL,
    trang_thai ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    tien_do INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, khoa_hoc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Danh Gia Khoa Hoc (Đánh giá khóa học)
CREATE TABLE IF NOT EXISTS danh_gia_khoa_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    khoa_hoc_id INT NOT NULL,
    diem_so INT CHECK (diem_so >= 1 AND diem_so <= 5),
    noi_dung TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Bai Tap (Bài tập)
CREATE TABLE IF NOT EXISTS bai_tap (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_hoc_id INT NOT NULL,
    tieu_de VARCHAR(200) NOT NULL,
    mo_ta TEXT,
    noi_dung TEXT,
    han_nop DATETIME,
    is_required TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Nop Bai (Nộp bài)
CREATE TABLE IF NOT EXISTS nop_bai (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bai_tap_id INT NOT NULL,
    user_id INT NOT NULL,
    noi_dung TEXT,
    file_path VARCHAR(255),
    diem_so DECIMAL(5, 2),
    nhan_xet TEXT,
    trang_thai ENUM('submitted', 'graded', 'returned') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bai_tap_id) REFERENCES bai_tap(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Lich Hoc (Lịch học)
CREATE TABLE IF NOT EXISTS lich_hoc (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_hoc_id INT NOT NULL,
    ngay_hoc DATE NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    phong VARCHAR(100),
    link_zoom VARCHAR(255),
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thong Bao (Thông báo)
CREATE TABLE IF NOT EXISTS thong_bao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tieu_de VARCHAR(200) NOT NULL,
    noi_dung TEXT,
    loai ENUM('system', 'course', 'assignment') DEFAULT 'system',
    khoa_hoc_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thao Luận (Q&A khóa học)
CREATE TABLE IF NOT EXISTS thao_luan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    khoa_hoc_id INT NOT NULL,
    user_id INT NOT NULL,
    noi_dung TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Thanh toán
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    khoa_hoc_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    provider VARCHAR(50) DEFAULT 'sandbox',
    status ENUM('pending','paid','failed') DEFAULT 'paid',
    txn_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Điểm danh
CREATE TABLE IF NOT EXISTS diem_danh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lich_hoc_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('present','absent','late') DEFAULT 'present',
    noted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_attend (lich_hoc_id, user_id),
    FOREIGN KEY (lich_hoc_id) REFERENCES lich_hoc(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng Chứng nhận
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    khoa_hoc_id INT NOT NULL,
    code VARCHAR(50) UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert dữ liệu mẫu
-- Lưu ý: Password hash sẽ được tạo bằng Python khi chạy ứng dụng
-- Để tạo password hash, chạy: python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('admin123'))"
-- Admin mặc định (password: admin123) - Hash: pbkdf2:sha256:600000$...
-- Giáo viên mẫu (password: teacher123)
-- Học viên có thể tự đăng ký qua form

-- Khóa học mẫu
INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, gia, so_buoi, hinh_thuc, teacher_id) VALUES
('Lập trình Python cơ bản', 'Khóa học lập trình Python từ cơ bản đến nâng cao', 'Beginner', 500000, 20, 'online', 2),
('Lập trình Web với Flask', 'Học cách xây dựng ứng dụng web với Flask', 'Intermediate', 800000, 25, 'online', 2),
('Machine Learning cơ bản', 'Giới thiệu về Machine Learning và các thuật toán cơ bản', 'Advanced', 1200000, 30, 'hybrid', 2);

