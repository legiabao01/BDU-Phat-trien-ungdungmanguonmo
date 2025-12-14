# Hướng dẫn chụp ảnh demo cho báo cáo tiểu luận

## Danh sách ảnh cần chụp

### 1. Trang chủ (Homepage)
- **URL**: `https://code-do-frontend.vercel.app`
- **Cách chụp**: 
  - Mở trang chủ
  - Scroll xuống để thấy đầy đủ Hero, Stats, Features, Featured Courses
  - Chụp full page
- **Lưu tên**: `01-homepage.png`

### 2. Trang danh sách khóa học
- **URL**: `https://code-do-frontend.vercel.app/courses`
- **Cách chụp**:
  - Đảm bảo hiển thị nhiều khóa học
  - Thấy search bar và filter
- **Lưu tên**: `02-courses-list.png`

### 3. Trang chi tiết khóa học
- **URL**: `https://code-do-frontend.vercel.app/courses/{id}`
- **Cách chụp**:
  - Chụp phần trên (hình ảnh, tiêu đề, mô tả)
  - Chụp tabs (Tổng quan, Nội dung, Đánh giá, Thảo luận)
  - Chụp sidebar (giá, nút đăng ký)
- **Lưu tên**: `03-course-detail.png`

### 4. Trang học tập
- **URL**: `https://code-do-frontend.vercel.app/learn/{course_id}`
- **Cách chụp**:
  - Chụp sidebar bài học (tree structure)
  - Chụp video player
  - Chụp progress bar
- **Lưu tên**: `04-learn-page.png`

### 5. Dashboard Học viên
- **URL**: `https://code-do-frontend.vercel.app/dashboard`
- **Đăng nhập**: `student@example.com` / `student123`
- **Cách chụp**:
  - Chụp thống kê (cards)
  - Chụp khóa học đang học
  - Chụp progress bars
- **Lưu tên**: `05-student-dashboard.png`

### 6. Dashboard Giáo viên
- **URL**: `https://code-do-frontend.vercel.app/teacher/dashboard`
- **Đăng nhập**: `teacher1@example.com` / `teacher123`
- **Cách chụp**:
  - Chụp thống kê
  - Chụp danh sách khóa học
  - Chụp "Bài tập cần chấm"
- **Lưu tên**: `06-teacher-dashboard.png`

### 7. Dashboard Admin
- **URL**: `https://code-do-frontend.vercel.app/admin/dashboard`
- **Đăng nhập**: `admin@example.com` / `admin123`
- **Cách chụp**:
  - Chụp thống kê tổng quan
  - Chụp tab "Quản lý người dùng"
  - Chụp tab "Quản lý khóa học"
  - Chụp tab "Quản lý tiền"
- **Lưu tên**: `07-admin-dashboard.png`, `08-admin-users.png`, `09-admin-courses.png`, `10-admin-wallet.png`

### 8. Trang Ví điện tử
- **URL**: `https://code-do-frontend.vercel.app/wallet`
- **Cách chụp**:
  - Chụp số dư
  - Chụp form nạp tiền
  - Chụp lịch sử giao dịch
- **Lưu tên**: `11-wallet.png`

### 9. API Documentation (Swagger UI)
- **URL**: `https://code-do-backend.onrender.com/docs`
- **Cách chụp**:
  - Chụp danh sách API endpoints
  - Chụp chi tiết một endpoint (expand)
- **Lưu tên**: `12-api-docs.png`, `13-api-detail.png`

### 10. Deployment trên Render
- **URL**: `https://dashboard.render.com`
- **Cách chụp**:
  - Chụp Web Service `code-do-backend` (status: Live)
  - Chụp Environment Variables (ẩn giá trị nhạy cảm)
  - Chụp Logs
- **Lưu tên**: `14-render-service.png`, `15-render-env.png`

### 11. Deployment trên Vercel
- **URL**: `https://vercel.com`
- **Cách chụp**:
  - Chụp Project `frontend` (status: Ready)
  - Chụp Deployments
  - Chụp Environment Variables
- **Lưu tên**: `16-vercel-project.png`, `17-vercel-deployments.png`

## Công cụ chụp ảnh

### Cách 1: Browser Developer Tools
1. Mở trang cần chụp
2. Nhấn `F12` để mở Developer Tools
3. Nhấn `Ctrl+Shift+P` (Windows) hoặc `Cmd+Shift+P` (Mac)
4. Gõ "screenshot" và chọn "Capture full size screenshot"

### Cách 2: Extension Browser
- **Full Page Screen Capture** (Chrome/Edge)
- **FireShot** (Chrome/Firefox)
- **Awesome Screenshot** (Chrome/Firefox)

### Cách 3: Snipping Tool (Windows)
1. Nhấn `Windows + Shift + S`
2. Chọn vùng cần chụp
3. Lưu ảnh

## Lưu ý khi chụp ảnh

1. **Ẩn thông tin nhạy cảm**: 
   - Che email, password
   - Che API keys, tokens
   - Che thông tin cá nhân

2. **Chất lượng ảnh**:
   - Độ phân giải cao (ít nhất 1920x1080)
   - Format PNG hoặc JPG
   - Rõ ràng, không mờ

3. **Nội dung ảnh**:
   - Chụp đầy đủ nội dung quan trọng
   - Có thể chụp nhiều ảnh cho một trang
   - Đảm bảo text dễ đọc

4. **Đặt tên file**:
   - Tên rõ ràng, có thứ tự
   - Ví dụ: `01-homepage.png`, `02-courses-list.png`

## Chèn ảnh vào báo cáo

1. Tạo thư mục `images/` trong cùng thư mục với báo cáo
2. Copy tất cả ảnh vào thư mục `images/`
3. Chèn ảnh vào file `BAO_CAO_TIEU_LUAN.md`:

```markdown
![Trang chủ](images/01-homepage.png)
*Hình 1: Trang chủ hệ thống*

![Danh sách khóa học](images/02-courses-list.png)
*Hình 2: Trang danh sách khóa học*
```

## Checklist ảnh cần có

- [ ] Trang chủ
- [ ] Danh sách khóa học
- [ ] Chi tiết khóa học
- [ ] Trang học tập
- [ ] Dashboard Học viên
- [ ] Dashboard Giáo viên
- [ ] Dashboard Admin (4 tabs)
- [ ] Trang Ví điện tử
- [ ] API Documentation
- [ ] Render Deployment
- [ ] Vercel Deployment

**Tổng cộng: ít nhất 12-15 ảnh**

