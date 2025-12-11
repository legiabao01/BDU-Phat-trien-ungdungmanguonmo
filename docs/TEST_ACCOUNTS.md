# 👥 Tài khoản Test

## Tài khoản có sẵn sau khi seed data

### Admin
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Quyền:** Quản lý toàn bộ hệ thống

### Teacher
- **Email:** `teacher1@example.com` hoặc `teacher2@example.com`
- **Password:** `teacher123`
- **Quyền:** Quản lý khóa học, tạo bài tập, chấm điểm

### Student
- **Email:** `student@example.com`, `student1@example.com`, `student2@example.com`
- **Password:** `student123`
- **Quyền:** Đăng ký khóa học, học tập, nộp bài

## Cách seed tài khoản

```bash
psql -U elearn -d elearning -f database/seed_users.sql
```

**Lưu ý:** 
- Teacher accounts đã được tạo trong `seed_programming_courses_fixed_utf8.sql`
- Chạy `seed_users.sql` để thêm admin và student accounts

## Tạo tài khoản mới

Có thể tạo tài khoản mới qua:
1. **Frontend:** Trang đăng ký (`/register`)
2. **API:** `POST /api/auth/register`
3. **Swagger:** `http://127.0.0.1:8001/docs` → `/api/auth/register`



