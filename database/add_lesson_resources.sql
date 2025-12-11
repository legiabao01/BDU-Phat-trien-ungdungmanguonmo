-- Thêm các cột tài liệu và resources cho bài học
ALTER TABLE chi_tiet_khoa_hoc 
ADD COLUMN IF NOT EXISTS tai_lieu_pdf VARCHAR(500),
ADD COLUMN IF NOT EXISTS tai_lieu_links JSONB,
ADD COLUMN IF NOT EXISTS resources JSONB;

-- Cập nhật các cột hiện có nếu NULL
UPDATE chi_tiet_khoa_hoc 
SET tai_lieu_links = '[]'::jsonb 
WHERE tai_lieu_links IS NULL;

UPDATE chi_tiet_khoa_hoc 
SET resources = '[]'::jsonb 
WHERE resources IS NULL;

