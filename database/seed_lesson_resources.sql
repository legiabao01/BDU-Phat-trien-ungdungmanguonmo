-- Seed dữ liệu mẫu cho tài liệu và resources
-- Chạy sau khi đã chạy add_lesson_resources.sql

-- Cập nhật bài học đầu tiên của khóa học đầu tiên với tài liệu mẫu
UPDATE chi_tiet_khoa_hoc 
SET 
  tai_lieu_links = '[
    {"title": "Tài liệu Python chính thức", "url": "https://docs.python.org/3/"},
    {"title": "Python Tutorial - W3Schools", "url": "https://www.w3schools.com/python/"},
    {"title": "Stack Overflow Python", "url": "https://stackoverflow.com/questions/tagged/python"}
  ]'::jsonb,
  resources = '[
    {
      "type": "link",
      "title": "Python.org - Getting Started",
      "url": "https://www.python.org/about/gettingstarted/",
      "description": "Hướng dẫn bắt đầu với Python từ trang chủ chính thức"
    },
    {
      "type": "link",
      "title": "Real Python Tutorials",
      "url": "https://realpython.com/",
      "description": "Tài liệu Python chất lượng cao với ví dụ thực tế"
    },
    {
      "type": "code",
      "title": "Python Playground",
      "url": "https://repl.it/languages/python3",
      "description": "Chạy code Python trực tuyến để thực hành"
    }
  ]'::jsonb
WHERE id = (
  SELECT MIN(id) FROM chi_tiet_khoa_hoc
);

-- Cập nhật bài học thứ 2 với tài liệu khác
UPDATE chi_tiet_khoa_hoc 
SET 
  tai_lieu_links = '[
    {"title": "GitHub - Python Examples", "url": "https://github.com/trending?l=python"},
    {"title": "Python Cheat Sheet", "url": "https://www.pythoncheatsheet.org/"}
  ]'::jsonb,
  resources = '[
    {
      "type": "link",
      "title": "Python Exercises",
      "url": "https://www.practicepython.org/",
      "description": "Bài tập Python từ cơ bản đến nâng cao"
    }
  ]'::jsonb
WHERE id = (
  SELECT id FROM chi_tiet_khoa_hoc 
  ORDER BY id 
  LIMIT 1 OFFSET 1
);

-- Hiển thị kết quả
SELECT 
  id,
  tieu_de_muc,
  tai_lieu_pdf,
  tai_lieu_links,
  resources
FROM chi_tiet_khoa_hoc
WHERE tai_lieu_links IS NOT NULL OR resources IS NOT NULL
ORDER BY id
LIMIT 5;

