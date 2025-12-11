# Hướng dẫn Test Tính năng Tài liệu và Resources

## Bước 1: Chạy Migration SQL

Chạy migration để thêm các cột mới vào database:

```powershell
.\scripts\run-sql.ps1 -File "database\add_lesson_resources.sql"
```

Hoặc chạy trực tiếp:
```powershell
psql -U elearn -d elearning -f database\add_lesson_resources.sql
```

## Bước 2: Khởi động Backend

```powershell
cd fastapi_app
python -m uvicorn main:app --reload --port 8001
```

## Bước 3: Test qua Swagger UI

Truy cập: http://127.0.0.1:8001/docs

### 3.1. Lấy danh sách bài học (để xem cấu trúc hiện tại)

**GET** `/api/courses/{course_id}/lessons`

Ví dụ: `GET /api/courses/1/lessons`

### 3.2. Cập nhật bài học với tài liệu

**PUT** `/api/lessons/{lesson_id}`

**Headers:**
- Authorization: Bearer {token} (lấy token từ login)

**Form Data:**
- `tieu_de_muc`: (optional) Tiêu đề bài học
- `noi_dung`: (optional) Nội dung
- `video_path`: (optional) Đường dẫn video
- `tai_lieu_pdf_file`: (optional) File PDF để upload
- `tai_lieu_links`: (optional) JSON string, ví dụ:
  ```json
  [
    {"title": "Tài liệu Python", "url": "https://docs.python.org/3/"},
    {"title": "Stack Overflow", "url": "https://stackoverflow.com/"}
  ]
  ```
- `resources`: (optional) JSON string, ví dụ:
  ```json
  [
    {
      "type": "pdf",
      "title": "Slide bài giảng",
      "url": "/static/uploads/pdfs/slide.pdf",
      "description": "Slide tổng hợp kiến thức"
    },
    {
      "type": "link",
      "title": "GitHub Repository",
      "url": "https://github.com/example/repo",
      "description": "Code mẫu và bài tập"
    },
    {
      "type": "code",
      "title": "Code Playground",
      "url": "https://repl.it/example",
      "description": "Thực hành code online"
    }
  ]
  ```

**Ví dụ cURL:**
```bash
curl -X PUT "http://127.0.0.1:8001/api/lessons/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "tai_lieu_links=[{\"title\":\"Python Docs\",\"url\":\"https://docs.python.org/\"}]" \
  -F "resources=[{\"type\":\"link\",\"title\":\"GitHub\",\"url\":\"https://github.com\",\"description\":\"Code examples\"}]"
```

### 3.3. Xem bài học đã cập nhật

**GET** `/api/lessons/{lesson_id}`

Kiểm tra các trường:
- `tai_lieu_pdf`: Đường dẫn file PDF
- `tai_lieu_links`: Mảng các link
- `resources`: Mảng các tài nguyên

## Bước 4: Test qua Frontend

1. Khởi động frontend:
```powershell
cd frontend
npm run dev
```

2. Đăng nhập với tài khoản Teacher hoặc Admin

3. Vào khóa học → Chọn bài học → Xem phần "Tài liệu học tập"

4. Nếu chưa có tài liệu, sẽ hiển thị: "Chưa có bài tập nào"

## Bước 5: Thêm tài liệu qua API (cho Teacher/Admin)

### Upload PDF:
```bash
curl -X PUT "http://127.0.0.1:8001/api/lessons/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "tai_lieu_pdf_file=@/path/to/file.pdf"
```

### Thêm links:
```bash
curl -X PUT "http://127.0.0.1:8001/api/lessons/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'tai_lieu_links=[{"title":"Python Tutorial","url":"https://www.python.org/about/gettingstarted/"}]'
```

### Thêm resources:
```bash
curl -X PUT "http://127.0.0.1:8001/api/lessons/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'resources=[{"type":"link","title":"Codecademy","url":"https://www.codecademy.com/learn/learn-python-3","description":"Interactive Python course"}]'
```

## Bước 6: Kiểm tra hiển thị trên Frontend

1. Vào trang học: `/learn/{course_id}`
2. Chọn một bài học có tài liệu
3. Kiểm tra:
   - ✅ Nút "Tải tài liệu PDF" (nếu có PDF)
   - ✅ Danh sách "Liên kết hữu ích" (nếu có links)
   - ✅ Cards "Tài nguyên khác" với icon phù hợp (pdf/link/code)

## Lưu ý

- File PDF sẽ được lưu trong `static/uploads/pdfs/`
- Đảm bảo thư mục `static/uploads/pdfs/` tồn tại
- JSON trong Form Data phải là string, không phải object
- Chỉ Teacher của khóa học hoặc Admin mới có quyền cập nhật

