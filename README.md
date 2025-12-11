# 🎓 Ứng dụng Học Trực Tuyến

Dự án cuối kỳ môn **Phát triển ứng dụng mã nguồn mở**

## 📋 Tổng quan

Hệ thống học trực tuyến với đầy đủ chức năng cho học viên, giáo viên và quản trị viên. Hỗ trợ video bài giảng, bài tập, thảo luận, theo dõi tiến độ và cấp chứng nhận.

## 🎯 Tình hình hiện tại

### ✅ Đã hoàn thành

**Backend:**
- ✅ FastAPI + PostgreSQL + JWT authentication
- ✅ API đăng ký khóa học (Enrollment)
- ✅ API bài tập (Assignments) - tạo, nộp, chấm điểm
- ✅ API thảo luận (Discussion Forum)
- ✅ API chứng nhận (Certificates)
- ✅ API theo dõi tiến độ (Progress Tracking)
- ✅ Quản lý người dùng (User management)

**Frontend:**
- ✅ React + Vite + Bootstrap 5
- ✅ Đã migrate UI từ Flask templates
- ✅ Trang danh sách khóa học (có search/filter)
- ✅ Trang học tập với lesson tree, video player
- ✅ Trang bài tập với file upload
- ✅ Forum thảo luận
- ✅ Trang chứng nhận
- ✅ Dashboard cho Student/Teacher/Admin

**Database:**
- ✅ Đã seed 4 khóa học lập trình:
  - Python Cơ Bản (8 bài học)
  - JavaScript Full Stack (8 bài học)
  - Web Development Cơ Bản (5 bài học)
  - Data Science với Python (5 bài học)

**Tính năng:**
- ✅ Video player (YouTube, Vimeo, HTML5)
- ✅ Drip content (bài học locked/unlocked)
- ✅ Progress tracking với progress bar
- ✅ File upload cho bài tập
- ✅ Real-time discussion forum

### 🔄 Đang phát triển

- [ ] Payment integration
- [ ] Email notifications
- [ ] Video streaming optimization
- [ ] Mobile responsive improvements

## 🛠️ Công nghệ sử dụng

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **ORM:** SQLAlchemy
- **Validation:** Pydantic

### Frontend
- **Framework:** React 18
- **Build tool:** Vite
- **UI:** Bootstrap 5 + Custom CSS
- **HTTP Client:** Axios
- **Routing:** React Router DOM

## 🚀 Cách chạy dự án

### Yêu cầu

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Bước 1: Clone repository

```bash
git clone https://github.com/legiabao01/BDU-Phat-trien-ungdungmanguonmo.git
cd BDU-Phat-trien-ungdungmanguonmo
```

### Bước 2: Setup Backend

#### 2.1. Tạo virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 2.2. Cài đặt dependencies

```bash
pip install -r fastapi_app/requirements.txt
```

#### 2.3. Cấu hình database

> 📖 **Xem chi tiết**: `docs/DATABASE_SETUP.md` - Hướng dẫn đầy đủ về các file SQL

1. **Tạo database và user** (nếu chưa có):
```bash
psql -U postgres
```

```sql
CREATE DATABASE elearning;
CREATE USER elearn WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE elearning TO elearn;
\q
```

2. **Tạo bảng** (từ thư mục root):
```bash
# Cách 1: Chạy tự động (KHUYẾN NGHỊ)
.\scripts\setup-all-migrations.ps1

# Cách 2: Chạy thủ công
psql -U elearn -d elearning -f database/schema_pg.sql
```

3. **Tạo bảng enrollment**:
```bash
psql -U elearn -d elearning -f database/create_enrollment_table.sql
```

4. **Seed dữ liệu**:
```bash
psql -U elearn -d elearning -f database/seed_programming_courses_fixed_utf8.sql
```

**Hoặc dùng script tự động:**
```powershell
.\setup-database.ps1
```

#### 2.4. Tạo file `.env`

Tạo file `fastapi_app/.env`:

```env
DATABASE_URL=postgresql+psycopg://elearn:your_password@localhost:5432/elearning
JWT_SECRET=your-secret-key-here-change-in-production
JWT_ALG=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:3000
```

#### 2.5. Chạy Backend

```bash
# Từ thư mục root (QUAN TRỌNG!)
uvicorn fastapi_app.main:app --reload --port 8001
```

**Hoặc dùng script:**
```powershell
.\fastapi_app\run.ps1
```

Backend sẽ chạy tại: `http://127.0.0.1:8001`
API docs: `http://127.0.0.1:8001/docs`

### Bước 3: Setup Frontend

#### 3.1. Cài đặt dependencies

```bash
cd frontend
npm install
```

#### 3.2. Chạy Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Bước 4: Chạy cả 2 server cùng lúc (Khuyến nghị)

```powershell
# Windows PowerShell
.\start-dev.ps1

# Windows CMD
start-dev.bat
```

Script sẽ tự động chạy cả Backend và Frontend trong các cửa sổ riêng.

## 📁 Cấu trúc dự án

```
BDU-Phat-trien-ungdungmanguonmo/
├── fastapi_app/              # Backend FastAPI
│   ├── main.py              # Entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   ├── core/                # Config, security
│   ├── db/                  # Database session
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── api/routes/          # API endpoints
│
├── frontend/                # Frontend React
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Context API (Auth)
│   │   └── styles/          # CSS files
│   ├── package.json
│   └── vite.config.js
│
├── database/                # SQL scripts
│   ├── schema_pg.sql        # Database schema
│   ├── create_enrollment_table.sql
│   └── seed_programming_courses_fixed_utf8.sql
│
├── templates/               # Flask templates (legacy)
├── static/                  # Static files (legacy)
├── app.py                   # Flask app (legacy)
│
├── setup-database.ps1       # Auto setup database
├── start-dev.ps1            # Run both servers
└── README.md                # File này
```

## 🔌 API Endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập (nhận JWT token)
- `GET /api/users/me` - Thông tin user hiện tại

### Courses
- `GET /api/courses` - Danh sách khóa học
- `GET /api/courses/{id}` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học (teacher/admin)
- `GET /api/courses/{id}/lessons` - Danh sách bài học

### Enrollment
- `POST /api/courses/{id}/enroll` - Đăng ký khóa học
- `GET /api/users/me/enrollments` - Khóa học đã đăng ký
- `GET /api/courses/{id}/enrollment` - Kiểm tra đã đăng ký

### Assignments
- `GET /api/courses/{id}/assignments` - Danh sách bài tập
- `POST /api/courses/{id}/assignments` - Tạo bài tập (teacher)
- `POST /api/assignments/{id}/submit` - Nộp bài
- `POST /api/submissions/{id}/grade` - Chấm bài (teacher)

### Discussion
- `GET /api/courses/{id}/discussions` - Danh sách thảo luận
- `POST /api/courses/{id}/discussions` - Tạo thảo luận

### Progress & Certificates
- `POST /api/courses/{id}/progress` - Cập nhật tiến độ
- `GET /api/courses/{id}/progress` - Lấy tiến độ
- `GET /api/courses/{id}/certificate` - Lấy chứng nhận

**Xem đầy đủ API tại:** `http://127.0.0.1:8001/docs`

## 👥 Tài khoản test

Sau khi seed data, có các tài khoản sau:

### Admin
- Email: `admin@example.com`
- Password: `admin123`

### Teacher
- Email: `teacher1@example.com` hoặc `teacher2@example.com`
- Password: `teacher123`

### Student
- Email: `student@example.com`, `student1@example.com`, `student2@example.com`
- Password: `student123`

**Lưu ý:** Chạy `database/seed_users.sql` để tạo admin và student accounts (teacher đã có trong seed courses).

## 🧪 Test ứng dụng

1. **Mở Frontend:** `http://localhost:3000`
2. **Đăng ký/Đăng nhập** tài khoản mới
3. **Xem danh sách khóa học** (4 khóa học lập trình)
4. **Đăng ký khóa học** → Click "Đăng ký khóa học"
5. **Vào học** → Click "Vào học" → Xem video, làm bài tập
6. **Tham gia thảo luận** → Tab "Thảo luận"
7. **Xem Dashboard** → `/dashboard` (tự động chọn theo role)

## 📝 Lưu ý quan trọng

### Chạy Backend
- **PHẢI chạy từ thư mục root**, không phải từ trong `fastapi_app`
- Lệnh đúng: `uvicorn fastapi_app.main:app --reload --port 8001`
- Lệnh sai: `cd fastapi_app && uvicorn main:app ...` ❌

### Database
- Đảm bảo PostgreSQL đang chạy
- Kiểm tra password của user `elearn` trong `.env`
- Nếu lỗi encoding, dùng file `seed_programming_courses_fixed_utf8.sql`

### Frontend
- Cần chạy Backend trước (port 8001)
- Frontend tự động proxy API requests đến Backend

## 🐛 Troubleshooting

### Backend không chạy được
- Kiểm tra PostgreSQL đang chạy: `psql -U postgres`
- Kiểm tra `.env` file có đúng không
- Kiểm tra virtual environment đã activate chưa

### Frontend không kết nối được Backend
- Đảm bảo Backend đang chạy ở port 8001
- Kiểm tra CORS settings trong `fastapi_app/main.py`
- Kiểm tra proxy trong `frontend/vite.config.js`

### Lỗi "psql: command not found"
- Dùng full path: `"C:\Program Files\PostgreSQL\16\bin\psql.exe"`
- Hoặc thêm PostgreSQL vào PATH

## 📚 Tài liệu tham khảo

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 👨‍💻 Đóng góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License

## 👥 Team

Nhóm sinh viên - Môn Phát triển ứng dụng mã nguồn mở

---

**Cần hỗ trợ?** Xem thêm trong thư mục `docs/`
