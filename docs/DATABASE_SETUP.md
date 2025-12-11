# 🗄️ Hướng dẫn Setup Database

## 📋 Tổng quan

Dự án sử dụng **PostgreSQL** làm database. Các file SQL được chia thành 2 loại:

1. **Schema/Migration files** - Tạo bảng và cấu trúc database (BẮT BUỘC)
2. **Seed data files** - Dữ liệu mẫu để test (TÙY CHỌN)

---

## ✅ Các file BẮT BUỘC phải chạy (theo thứ tự)

### 1. **schema_pg.sql** - Tạo cấu trúc database cơ bản
- Tạo tất cả các bảng chính: `users`, `khoa_hoc`, `chi_tiet_khoa_hoc`, `bai_tap`, ...
- **Chạy đầu tiên** - Đây là file quan trọng nhất!

### 2. **create_enrollment_table.sql** - Bảng đăng ký khóa học
- Tạo bảng `dang_ky_khoa_hoc`

### 3. **create_notifications_table.sql** - Bảng thông báo
- Tạo bảng `thong_bao`
- Hoặc dùng `fix_notifications_table.sql` nếu bảng đã tồn tại nhưng thiếu cột

### 4. **create_payment_table.sql** - Bảng thanh toán
- Tạo bảng `thanh_toan`

### 5. **add_lesson_resources.sql** - Thêm cột tài liệu cho bài học
- Thêm các cột: `tai_lieu_pdf`, `tai_lieu_links`, `resources` vào bảng `chi_tiet_khoa_hoc`

### 6. **add_diem_toi_da_to_bai_tap.sql** - Thêm cột điểm tối đa
- Thêm cột `diem_toi_da` vào bảng `bai_tap`

---

## 🌱 Các file SEED DATA (TÙY CHỌN - chỉ để test)

### 1. **seed_users.sql** - Tạo tài khoản mẫu
- Admin: `admin@example.com` / `admin123`
- Teacher: `teacher@example.com` / `teacher123`
- Student: `student@example.com` / `student123`

### 2. **seed_programming_courses_fixed_utf8.sql** - Khóa học mẫu
- Tạo các khóa học lập trình (Python, JavaScript, ...)
- Tạo tài khoản giáo viên cho các khóa học

### 3. **seed_lesson_resources.sql** - Tài liệu mẫu
- Thêm tài liệu và links cho một số bài học mẫu

---

## 🚀 Cách chạy (3 cách)

### Cách 1: Dùng script tự động (KHUYẾN NGHỊ)

```powershell
# Chạy tất cả migrations và seed data
.\scripts\setup-database.ps1
```

Script này sẽ:
- Tự động tìm `psql.exe`
- Chạy các file SQL theo thứ tự
- Hỏi bạn có muốn seed data không

### Cách 2: Chạy từng file thủ công

```powershell
# 1. Schema cơ bản
psql -U elearn -d elearning -f database\schema_pg.sql

# 2. Các bảng bổ sung
psql -U elearn -d elearning -f database\create_enrollment_table.sql
psql -U elearn -d elearning -f database\create_notifications_table.sql
psql -U elearn -d elearning -f database\create_payment_table.sql

# 3. Migrations
psql -U elearn -d elearning -f database\add_lesson_resources.sql
psql -U elearn -d elearning -f database\add_diem_toi_da_to_bai_tap.sql

# 4. Seed data (tùy chọn)
psql -U elearn -d elearning -f database\seed_users.sql
psql -U elearn -d elearning -f database\seed_programming_courses_fixed_utf8.sql
```

### Cách 3: Dùng script run-sql.ps1

```powershell
# Chạy một file cụ thể
.\scripts\run-sql.ps1 -File "database\schema_pg.sql"
```

---

## ⚠️ Lưu ý quan trọng

1. **Thứ tự chạy**: Phải chạy `schema_pg.sql` TRƯỚC các file khác
2. **Database phải tồn tại**: Đảm bảo đã tạo database `elearning` trước
3. **User phải có quyền**: User `elearn` phải có quyền CREATE TABLE
4. **Nếu bảng đã tồn tại**: Dùng các file `fix_*.sql` thay vì `create_*.sql`

---

## 🔍 Kiểm tra sau khi chạy

```sql
-- Kiểm tra các bảng đã được tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Kiểm tra dữ liệu seed
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM khoa_hoc;
```

---

## 📝 Tóm tắt nhanh

**Nếu database MỚI:**
1. Chạy `schema_pg.sql` (bắt buộc)
2. Chạy các file `create_*.sql` (bắt buộc)
3. Chạy các file `add_*.sql` (bắt buộc)
4. Chạy các file `seed_*.sql` (tùy chọn - để test)

**Nếu database ĐÃ CÓ:**
- Chỉ chạy các file `fix_*.sql` hoặc `add_*.sql` nếu thiếu cột/bảng
- File `fix_notifications_table.sql` dùng khi bảng `thong_bao` đã tồn tại nhưng thiếu cột

---

**Cập nhật**: 2024-12-12

