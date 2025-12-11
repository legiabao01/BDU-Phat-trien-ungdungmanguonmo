# 🚀 Hướng dẫn Setup

## Yêu cầu

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

## Setup nhanh

### 1. Clone và cài đặt

```bash
git clone https://github.com/legiabao01/BDU-Phat-trien-ungdungmanguonmo.git
cd BDU-Phat-trien-ungdungmanguonmo
```

### 2. Setup Backend

```bash
# Tạo venv
python -m venv venv
venv\Scripts\activate  # Windows

# Cài dependencies
pip install -r fastapi_app/requirements.txt

# Tạo .env
cp fastapi_app/env.example fastapi_app/.env
# Chỉnh sửa fastapi_app/.env với thông tin database của bạn
```

### 3. Setup Database

```powershell
# Tạo database và user
psql -U postgres
CREATE DATABASE elearning;
CREATE USER elearn WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE elearning TO elearn;
\q

# Chạy schema và seed data
.\setup-database.ps1
```

### 4. Setup Frontend

```bash
cd frontend
npm install
```

### 5. Chạy ứng dụng

```powershell
# Chạy cả 2 server
.\start-dev.ps1
```

Hoặc chạy riêng:

```bash
# Terminal 1 - Backend
uvicorn fastapi_app.main:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8001
- API Docs: http://127.0.0.1:8001/docs

## Tài khoản test

- Teacher: `teacher1@example.com` / `teacher123`
- Tạo student account mới qua trang đăng ký



