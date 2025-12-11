-- Tạo bảng enrollment nếu chưa có
CREATE TABLE IF NOT EXISTS dang_ky_khoa_hoc (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    khoa_hoc_id INTEGER NOT NULL REFERENCES khoa_hoc(id) ON DELETE CASCADE,
    trang_thai VARCHAR(20) DEFAULT 'active',
    ngay_dang_ky TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, khoa_hoc_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_user ON dang_ky_khoa_hoc(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_course ON dang_ky_khoa_hoc(khoa_hoc_id);



