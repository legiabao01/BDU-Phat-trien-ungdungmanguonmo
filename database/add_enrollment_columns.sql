-- Thêm các cột còn thiếu vào bảng dang_ky_khoa_hoc
ALTER TABLE dang_ky_khoa_hoc 
ADD COLUMN IF NOT EXISTS ngay_dang_ky TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE dang_ky_khoa_hoc 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

