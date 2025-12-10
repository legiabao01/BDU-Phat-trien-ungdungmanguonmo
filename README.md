# Ứng dụng Học Trực Tuyến

Dự án cuối kỳ môn **Phát triển ứng dụng mã nguồn mở**

## 📋 Mô tả

Hệ thống quản lý học trực tuyến với đầy đủ chức năng cho học viên, giáo viên và quản trị viên.

## 🛠️ Công nghệ sử dụng

### Backend chính (Flask - Legacy)
- **Backend**: Python Flask
- **Frontend**: Jinja2 Templates, HTML, CSS, JavaScript
- **Database**: MySQL
- **Authentication**: Session-based với password hashing

### API Backend (FastAPI - Mới)
- **Backend API**: FastAPI với PostgreSQL
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger UI tại `/docs`

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone <your-repo-url>
cd Webhoctructuyen
```

### 2. Tạo môi trường ảo

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình Database

1. Tạo database MySQL:
```sql
mysql -u root -p < database/schema.sql
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Chỉnh sửa file `.env` với thông tin MySQL của bạn:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=webhoctructuyen
```

### 5. Chạy ứng dụng Flask (Legacy)

```bash
python app.py
```

Truy cập: http://localhost:5000

### 6. Chạy FastAPI Backend (Mới)

1. **Cài đặt PostgreSQL** và tạo database:
```bash
# Tạo database và user
psql -U postgres
CREATE DATABASE elearning;
CREATE USER elearn WITH PASSWORD 'elearn123';
GRANT ALL PRIVILEGES ON DATABASE elearning TO elearn;
\q
```

2. **Chạy schema PostgreSQL**:
```bash
psql -U elearn -d elearning -f database/schema_pg.sql
```

3. **Cấu hình environment**:
Tạo file `fastapi_app/.env`:
```env
DATABASE_URL=postgresql+psycopg://elearn:elearn123@localhost:5432/elearning
JWT_SECRET=your-secret-key-here-change-in-production
JWT_ALG=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

4. **Cài đặt dependencies FastAPI**:
```bash
pip install -r fastapi_app/requirements.txt
pip install email-validator bcrypt==3.2.2
```

5. **Chạy server**:
```bash
uvicorn fastapi_app.main:app --env-file fastapi_app/.env --port 8001
```

6. **Truy cập**:
- API Docs (Swagger): http://127.0.0.1:8001/docs
- Health check: http://127.0.0.1:8001/health

### 7. Seed dữ liệu mẫu (PostgreSQL)

```bash
psql -U elearn -d elearning -f database/seed_courses.sql
```

**Kiểm tra dữ liệu**: Mở Swagger tại `/docs` và gọi `GET /api/courses`

## 👥 Tài khoản mặc định

- **Admin**: admin@example.com / admin123
- **Teacher**: teacher@example.com / teacher123

## 🔌 FastAPI Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập (nhận JWT token)
  - Hỗ trợ form (username/password) hoặc JSON (email/password)
- `GET /api/users/me` - Lấy thông tin user hiện tại (cần Bearer token)

### Courses
- `GET /api/courses` - Lấy danh sách khóa học
- `POST /api/courses` - Tạo khóa học mới
- `GET /api/courses/{course_id}/lessons` - Lấy danh sách bài học của khóa học

### Health Check
- `GET /health` - Kiểm tra trạng thái server

**Lưu ý**: 
- Sử dụng Swagger UI tại `/docs` để test API
- Authorize với Bearer token: Nhấn nút "Authorize" → chọn "BearerAuth" → dán token

## 📁 Cấu trúc dự án

```
Webhoctructuyen/
├── app.py                 # File chính Flask (legacy)
├── requirements.txt       # Dependencies Flask
├── .env.example          # Mẫu file cấu hình
├── .gitignore            # Git ignore file
├── README.md             # File này
├── database/
│   ├── schema.sql        # MySQL schema (legacy)
│   ├── schema_pg.sql     # PostgreSQL schema (FastAPI)
│   └── seed_courses.sql  # Seed data mẫu
├── fastapi_app/          # FastAPI Backend (mới)
│   ├── main.py          # Entry point FastAPI
│   ├── requirements.txt  # Dependencies FastAPI
│   ├── .env             # Environment variables
│   ├── core/            # Core config, security
│   ├── db/              # Database session, base
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   └── api/
│       └── routes/      # API routes
├── templates/            # Jinja2 templates (Flask)
│   ├── index.html
│   ├── courses.html
│   ├── course_detail.html
│   ├── login.html
│   ├── register.html
│   ├── student/
│   ├── teacher/
│   └── admin/
├── static/               # Static files
│   ├── css/
│   ├── js/
│   └── images/
└── uploads/             # Uploaded files
```

## 🚀 Chức năng nâng cao

### 1. Hệ thống đánh giá và phản hồi (0.5 điểm)
- Học viên có thể đánh giá khóa học (1-5 sao)
- Xem đánh giá của các học viên khác
- Tính điểm trung bình tự động

### 2. Quản lý bài tập và nộp bài (0.5 điểm)
- Giáo viên tạo bài tập cho khóa học
- Học viên nộp bài và xem điểm
- Giáo viên chấm điểm và nhận xét

### 3. Hệ thống thông báo (0.5 điểm)
- Thông báo hệ thống
- Thông báo theo khóa học
- Thông báo về bài tập mới

## 📝 Hướng dẫn sử dụng Git

### 1. Khởi tạo Git repository

```bash
git init
```

### 2. Thêm remote repository (GitHub)

```bash
git remote add origin https://github.com/your-username/your-repo-name.git
```

### 3. Commit và push code

```bash
# Thêm tất cả file
git add .

# Commit với message
git commit -m "Initial commit: Ứng dụng học trực tuyến"

# Push lên GitHub
git branch -M main
git push -u origin main
```

### 4. Các lệnh Git thường dùng

```bash
# Xem trạng thái
git status

# Xem lịch sử commit
git log

# Tạo branch mới
git checkout -b feature/new-feature

# Merge branch
git merge feature/new-feature

# Pull code mới nhất
git pull origin main
```

## 📄 License

MIT License

## 👨‍💻 Tác giả

Nhóm sinh viên - Môn Phát triển ứng dụng mã nguồn mở


