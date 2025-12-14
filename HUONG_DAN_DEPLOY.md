# 🚀 Hướng dẫn Deploy Code Đơ lên Render (Backend) và Vercel (Frontend)

Hướng dẫn chi tiết từng bước để deploy dự án lên production.

## 📋 Yêu cầu

- ✅ Tài khoản GitHub (đã push code lên repository)
- ✅ Tài khoản Render (miễn phí): https://render.com
- ✅ Tài khoản Vercel (miễn phí): https://vercel.com
- ✅ Database PostgreSQL (Render cung cấp miễn phí)

---

## 🗄️ Bước 1: Setup Database PostgreSQL trên Render

### 1.1. Tạo PostgreSQL Database

1. Đăng nhập vào **Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → Chọn **"PostgreSQL"**
3. Điền thông tin:
   - **Name**: `code-do-database` (hoặc tên bạn muốn)
   - **Database**: `elearning`
   - **User**: `code_do_user` (hoặc để mặc định)
   - **Region**: Chọn gần nhất (Singapore hoặc US)
   - **Plan**: Chọn **Free** (hoặc Starter nếu cần)
4. Click **"Create Database"**

### 1.2. Lưu thông tin kết nối

Sau khi tạo xong, Render sẽ hiển thị 2 loại connection string:

#### **Internal Database URL** (Dùng cho backend trên Render)
- Format: `postgresql://user:pass@dpg-xxxxx-a/database`
- **Chỉ hoạt động trong Render network** (không thể kết nối từ máy local)
- **Copy URL này để thêm vào Environment Variables của backend service**

#### **External Database URL** (Dùng để kết nối từ máy local)
- Format: `postgresql://user:pass@dpg-xxxxx-a.singapore-postgres.render.com:5432/database`
- Hoặc: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com:5432/database`
- **Có thể kết nối từ máy local** (cần bật External Access)

**⚠️ QUAN TRỌNG:**
- **Backend trên Render**: Dùng **Internal Database URL**
- **Kết nối từ máy local**: Dùng **External Database URL** (nếu cần)

**Cách lấy External Database URL:**
1. Vào database trên Render Dashboard
2. Click tab **"Connect"** hoặc **"Info"**
3. Tìm **"External Database URL"** (khác với Internal URL)
4. Nếu không thấy, có thể cần bật **"External Access"** trong Settings

### 1.3. Chạy migrations trên database mới

**Cách 1: Dùng Render Shell (Khuyến nghị nhất - Không cần External URL)**

1. Vào database trên Render Dashboard
2. Click tab **"Connect"**
3. Click **"Connect via psql"** → Mở Render Shell trong browser
4. Copy và paste từng file SQL migration vào shell

**Cách 2: Dùng script PowerShell từ máy local (Cần External Database URL)**

```powershell
# Sử dụng External Database URL
.\scripts\run_migrations_render.ps1 -DatabaseUrl "postgresql://user:pass@dpg-xxxxx-a.singapore-postgres.render.com:5432/database"
```

**Cách 3: Dùng psql thủ công từ máy local (Cần External Database URL)**

```powershell
# Kết nối với External Database URL (phải có đầy đủ hostname và port)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgresql://code_do_user:password@dpg-xxxxx-a.singapore-postgres.render.com:5432/elearning"

# Sau đó chạy các file SQL
\i database/schema_pg.sql
\i database/create_enrollment_table.sql
# ... các file migration khác
```

**⚠️ Lưu ý:** Nếu gặp lỗi "could not translate host name", bạn đang dùng **Internal URL** thay vì **External URL**!

**Cách 2: Dùng Render Shell (Khuyến nghị)**

1. Vào database trên Render Dashboard
2. Click tab **"Connect"**
3. Click **"Connect via psql"** → Mở Render Shell
4. Chạy các lệnh SQL từ các file migration

**Cách 3: Tạo script tự động (Khuyến nghị nhất)**

Tạo một script Python để chạy migrations tự động khi deploy:

```python
# scripts/run_migrations.py
import os
import psycopg
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL not set")
    exit(1)

# Kết nối database
conn = psycopg.connect(DATABASE_URL)
cur = conn.cursor()

# Chạy các file migration
migration_files = [
    "database/schema_pg.sql",
    "database/create_enrollment_table.sql",
    "database/create_notifications_table.sql",
    "database/create_payments_table.sql",
    "database/add_tai_lieu_to_lessons.sql",
    "database/add_diem_toi_da_to_assignments.sql",
    "database/create_deposit_transactions.sql",
    "database/add_deposit_fields.sql",
    "database/add_user_balance.sql",
]

for file_path in migration_files:
    if Path(file_path).exists():
        print(f"Running {file_path}...")
        with open(file_path, "r", encoding="utf-8") as f:
            sql = f.read()
            cur.execute(sql)
        conn.commit()
        print(f"✓ {file_path} completed")

cur.close()
conn.close()
print("All migrations completed!")
```

---

## 🔧 Bước 2: Deploy Backend lên Render

### 2.1. Tạo Web Service trên Render

1. Vào **Render Dashboard** → Click **"New +"** → Chọn **"Web Service"**
2. Kết nối với GitHub repository của bạn
3. Chọn repository và branch (thường là `main`)

### 2.2. Cấu hình Build Settings

- **Name**: `code-do-backend` (hoặc tên bạn muốn)
- **Region**: Chọn gần nhất
- **Branch**: `main`
- **Root Directory**: Để trống (hoặc `fastapi_app` nếu cần)
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r fastapi_app/requirements.txt
  ```
- **Start Command**: 
  ```bash
  cd fastapi_app && uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

### 2.3. Cấu hình Environment Variables

Click **"Environment"** tab và thêm các biến sau:

| Key | Value | Ghi chú |
|-----|-------|---------|
| `DATABASE_URL` | `postgresql+psycopg://...` | **Internal Database URL** từ bước 1.2 |
| `JWT_SECRET` | `your-super-secret-key-change-this-123456` | Tạo một chuỗi ngẫu nhiên dài |
| `JWT_ALG` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | `1440` | |
| `ALLOWED_ORIGINS` | `["https://your-frontend.vercel.app"]` | **URL frontend trên Vercel** (sẽ cập nhật sau) |

**Lưu ý quan trọng:**
- `DATABASE_URL`: Dùng **Internal Database URL** (không phải External)
- `ALLOWED_ORIGINS`: Tạm thời để `["http://localhost:3000"]`, sau khi deploy frontend xong sẽ cập nhật lại

### 2.4. Deploy

1. Click **"Create Web Service"**
2. Render sẽ tự động build và deploy
3. Đợi build xong (thường 5-10 phút)
4. Lưu lại **URL backend**: `https://code-do-backend.onrender.com` (hoặc tên bạn đặt)

### 2.5. Chạy Migrations sau khi deploy

Sau khi backend đã deploy thành công:

**Cách 1: Dùng Render Shell**

1. Vào Web Service → Tab **"Shell"**
2. Chạy:
   ```bash
   cd fastapi_app
   python scripts/run_migrations.py
   ```

**Cách 2: Tạo một endpoint tạm để chạy migrations**

Thêm vào `fastapi_app/main.py`:

```python
@app.post("/admin/run-migrations")
async def run_migrations():
    # Chỉ chạy trong môi trường development hoặc với key bí mật
    import subprocess
    result = subprocess.run(["python", "scripts/run_migrations.py"], capture_output=True)
    return {"status": "success", "output": result.stdout.decode()}
```

---

## 🎨 Bước 3: Deploy Frontend lên Vercel

### 3.1. Tạo Project trên Vercel

1. Đăng nhập vào **Vercel**: https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repository của bạn
4. Chọn repository và branch

### 3.2. Cấu hình Build Settings

Vercel sẽ tự động detect Vite, nhưng cần cấu hình:

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` (nếu frontend ở trong thư mục con)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

### 3.3. Cấu hình Environment Variables

Thêm biến môi trường:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://code-do-backend.onrender.com` | **URL backend từ Render** |

**Lưu ý:** 
- Vercel yêu cầu prefix `VITE_` cho các biến môi trường
- URL backend phải có `https://` (không có trailing slash)

### 3.4. Deploy

1. Click **"Deploy"**
2. Đợi build xong (thường 2-5 phút)
3. Lưu lại **URL frontend**: `https://code-do-frontend.vercel.app` (hoặc tên bạn đặt)

### 3.5. Cập nhật CORS trên Backend

Sau khi có URL frontend:

1. Vào **Render Dashboard** → Web Service → **Environment**
2. Cập nhật `ALLOWED_ORIGINS`:
   ```
   ["https://code-do-frontend.vercel.app"]
   ```
3. Click **"Save Changes"** → Render sẽ tự động redeploy

---

## 🔄 Bước 4: Cập nhật Frontend để dùng API Production

### 4.1. Kiểm tra file `frontend/src/config/axios.js`

File này đã được tạo để tự động sử dụng `VITE_API_BASE_URL` từ environment variable.

### 4.2. Rebuild Frontend

Sau khi cập nhật environment variable trên Vercel:

1. Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Đảm bảo `VITE_API_BASE_URL` đã được set đúng
3. Vào **Deployments** → Click **"Redeploy"** để rebuild với env mới

---

## ✅ Bước 5: Kiểm tra và Test

### 5.1. Test Backend

1. Truy cập: `https://code-do-backend.onrender.com/docs`
2. Kiểm tra Swagger UI có hiển thị không
3. Test một vài endpoints

### 5.2. Test Frontend

1. Truy cập: `https://code-do-frontend.vercel.app`
2. Thử đăng ký/đăng nhập
3. Kiểm tra các chức năng chính

### 5.3. Kiểm tra CORS

Nếu gặp lỗi CORS:
- Kiểm tra `ALLOWED_ORIGINS` trên Render đã đúng chưa
- Đảm bảo URL frontend không có trailing slash
- Kiểm tra browser console để xem lỗi cụ thể

---

## 🐛 Troubleshooting

### ❌ Backend không start được

**Lỗi:** `ModuleNotFoundError`

**Giải pháp:**
- Kiểm tra `requirements.txt` có đầy đủ dependencies không
- Kiểm tra Build Command có chạy đúng không

**Lỗi:** `Database connection failed`

**Giải pháp:**
- Kiểm tra `DATABASE_URL` đã đúng chưa
- Đảm bảo dùng **Internal Database URL** (không phải External)
- Kiểm tra database đã được tạo và migrations đã chạy chưa

### ❌ Frontend không kết nối được Backend

**Lỗi:** `CORS error` hoặc `Network error`

**Giải pháp:**
1. Kiểm tra `VITE_API_BASE_URL` trên Vercel đã đúng chưa
2. Kiểm tra `ALLOWED_ORIGINS` trên Render đã có URL frontend chưa
3. Kiểm tra browser console để xem lỗi cụ thể

**Lỗi:** `404 Not Found` khi gọi API

**Giải pháp:**
- Kiểm tra `VITE_API_BASE_URL` có đúng không
- Đảm bảo URL backend có `/api` prefix (nếu cần)
- Kiểm tra routes trong backend

### ❌ Database migrations chưa chạy

**Giải pháp:**
1. Kết nối với database qua Render Shell
2. Chạy migrations thủ công
3. Hoặc tạo script tự động chạy khi deploy

---

## 📝 Checklist Deploy

### Backend (Render)
- [ ] Đã tạo PostgreSQL database trên Render
- [ ] Đã chạy migrations trên database
- [ ] Đã tạo Web Service trên Render
- [ ] Đã cấu hình đúng Build Command và Start Command
- [ ] Đã set đầy đủ Environment Variables
- [ ] Backend đã deploy thành công
- [ ] Có thể truy cập `/docs` endpoint

### Frontend (Vercel)
- [ ] Đã import repository vào Vercel
- [ ] Đã cấu hình đúng Root Directory và Build Command
- [ ] Đã set `VITE_API_BASE_URL` environment variable
- [ ] Frontend đã deploy thành công
- [ ] Đã cập nhật `ALLOWED_ORIGINS` trên backend với URL frontend

### Testing
- [ ] Backend API hoạt động (test qua `/docs`)
- [ ] Frontend có thể kết nối với backend
- [ ] Đăng ký/đăng nhập hoạt động
- [ ] Các chức năng chính hoạt động bình thường

---

## 🔐 Lưu ý Bảo mật

1. **JWT_SECRET**: Phải là chuỗi ngẫu nhiên dài và phức tạp
2. **DATABASE_URL**: Không được commit vào git
3. **ALLOWED_ORIGINS**: Chỉ cho phép domain frontend của bạn
4. **Environment Variables**: Không share với người khác

---

## 📞 Cần giúp đỡ?

Nếu gặp lỗi:
1. Kiểm tra logs trên Render Dashboard (Web Service → Logs)
2. Kiểm tra logs trên Vercel Dashboard (Deployment → Logs)
3. Kiểm tra browser console (F12)
4. Kiểm tra Network tab để xem API calls

---

**Chúc bạn deploy thành công! 🎉**

