-- Thêm cột ngay_dang_ky nếu chưa có
ALTER TABLE dang_ky_khoa_hoc 
ADD COLUMN IF NOT EXISTS ngay_dang_ky TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Thêm cột updated_at nếu chưa có
ALTER TABLE dang_ky_khoa_hoc 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Đảm bảo có UNIQUE constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'dang_ky_khoa_hoc_user_id_khoa_hoc_id_key'
    ) THEN
        ALTER TABLE dang_ky_khoa_hoc 
        ADD CONSTRAINT dang_ky_khoa_hoc_user_id_khoa_hoc_id_key 
        UNIQUE(user_id, khoa_hoc_id);
    END IF;
END $$;

