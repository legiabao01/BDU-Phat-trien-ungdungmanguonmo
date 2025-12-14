# 🔧 Sửa lỗi không đăng nhập được

## Các bước kiểm tra

### Bước 1: Kiểm tra Frontend có kết nối được Backend không

1. **Mở Frontend:** `https://bdu-phat-trien-ungdungmanguonmo-delta.vercel.app/login`
2. **Mở Browser Console:** Nhấn `F12` hoặc `Ctrl+Shift+I`
3. **Click tab "Console"**
4. **Thử đăng nhập** với email và password
5. **Xem lỗi trong Console:**
   - Nếu thấy lỗi CORS → Backend chưa cấu hình CORS đúng
   - Nếu thấy lỗi 404 → `VITE_API_BASE_URL` chưa được set
   - Nếu thấy lỗi Network → Backend không chạy hoặc URL sai

### Bước 2: Kiểm tra Environment Variable trên Vercel

1. **Vào Vercel Dashboard:** https://vercel.com
2. **Chọn project:** `bdu-phat-trien-ungdungmanguonmo-delta`
3. **Vào Settings → Environment Variables**
4. **Kiểm tra có biến:**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://code-do-backend.onrender.com`
   - Environment: Tất cả (Production, Preview, Development)
5. **Nếu chưa có hoặc sai:**
   - Thêm hoặc sửa biến
   - Save
   - Redeploy frontend

### Bước 3: Kiểm tra Backend có chạy không

1. **Mở:** `https://code-do-backend.onrender.com/docs`
2. **Nếu thấy Swagger UI:** Backend đang chạy ✅
3. **Nếu không thấy hoặc lỗi:** Backend có vấn đề, cần kiểm tra logs trên Render

### Bước 4: Kiểm tra CORS trên Render

1. **Vào Render Dashboard:** https://dashboard.render.com
2. **Chọn Web Service:** `code-do-backend`
3. **Vào tab "Environment"**
4. **Tìm biến `ALLOWED_ORIGINS`**
5. **Đảm bảo có URL frontend:**
   ```
   ["https://bdu-phat-trien-ungdungmanguonmo-delta.vercel.app"]
   ```
6. **Nếu chưa có hoặc sai:**
   - Sửa hoặc thêm biến
   - Save Changes
   - Render sẽ tự động redeploy

### Bước 5: Kiểm tra Network Tab

1. **Mở Browser Console** (F12)
2. **Click tab "Network"**
3. **Thử đăng nhập**
4. **Tìm request đến `/api/auth/login`**
5. **Kiểm tra:**
   - **Request URL:** Phải là `https://code-do-backend.onrender.com/api/auth/login`
   - **Status Code:**
     - `200` → Thành công ✅
     - `401` → Email/password sai
     - `404` → `VITE_API_BASE_URL` chưa được set
     - `CORS error` → CORS chưa được cấu hình đúng
     - `Network Error` → Backend không chạy hoặc URL sai

## Các lỗi thường gặp

### Lỗi 1: "Network Error" hoặc "Failed to fetch"

**Nguyên nhân:**
- `VITE_API_BASE_URL` chưa được set trên Vercel
- Backend không chạy

**Giải pháp:**
1. Set `VITE_API_BASE_URL` trên Vercel = `https://code-do-backend.onrender.com`
2. Redeploy frontend
3. Kiểm tra backend có chạy không: `https://code-do-backend.onrender.com/docs`

### Lỗi 2: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Nguyên nhân:**
- `ALLOWED_ORIGINS` trên Render chưa có URL frontend

**Giải pháp:**
1. Vào Render Dashboard → `code-do-backend` → Environment
2. Tìm `ALLOWED_ORIGINS`
3. Cập nhật thành: `["https://bdu-phat-trien-ungdungmanguonmo-delta.vercel.app"]`
4. Save Changes → Render tự động redeploy

### Lỗi 3: "404 Not Found" khi gọi API

**Nguyên nhân:**
- `VITE_API_BASE_URL` chưa được set hoặc sai

**Giải pháp:**
1. Kiểm tra `VITE_API_BASE_URL` trên Vercel
2. Đảm bảo giá trị: `https://code-do-backend.onrender.com` (không có trailing slash)
3. Redeploy frontend

### Lỗi 4: "401 Unauthorized" hoặc "Invalid credentials"

**Nguyên nhân:**
- Email/password sai
- Hoặc backend có vấn đề với authentication

**Giải pháp:**
1. Kiểm tra email/password có đúng không
2. Thử với tài khoản test:
   - Email: `student@test.com`
   - Password: `password123`
3. Nếu vẫn lỗi, kiểm tra logs trên Render

### Lỗi 5: "Cannot read property 'access_token' of undefined"

**Nguyên nhân:**
- Backend trả về response không đúng format

**Giải pháp:**
1. Kiểm tra Network tab xem response từ backend
2. Kiểm tra logs trên Render
3. Kiểm tra backend code có đúng không

## Test nhanh trong Browser Console

Mở Browser Console và chạy:

```javascript
// Kiểm tra environment variable
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test API call
fetch('https://code-do-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'student@test.com',
    password: 'password123'
  })
})
  .then(res => res.json())
  .then(data => console.log('Login Response:', data))
  .catch(err => console.error('Login Error:', err));
```

**Kết quả:**
- Nếu `VITE_API_BASE_URL` là `undefined` → Chưa set trên Vercel
- Nếu API call thành công → Backend OK, vấn đề ở frontend code
- Nếu API call lỗi CORS → Cần cập nhật `ALLOWED_ORIGINS` trên Render
- Nếu API call lỗi 404 → Backend không chạy hoặc URL sai

## Checklist

- [ ] `VITE_API_BASE_URL` đã được set trên Vercel = `https://code-do-backend.onrender.com`
- [ ] Frontend đã được redeploy sau khi set environment variable
- [ ] Backend đang chạy (truy cập `/docs` thấy Swagger UI)
- [ ] `ALLOWED_ORIGINS` trên Render có URL frontend
- [ ] Backend đã redeploy sau khi cập nhật CORS
- [ ] Không có lỗi trong Browser Console
- [ ] API call thành công trong Network tab

## Tài khoản test

Nếu cần test đăng nhập:

- **Student:**
  - Email: `student@test.com`
  - Password: `password123`

- **Teacher:**
  - Email: `teacher@test.com`
  - Password: `password123`

- **Admin:**
  - Email: `admin@test.com`
  - Password: `admin123`

---

**Lưu ý:** Sau khi sửa bất kỳ cấu hình nào, phải **redeploy** để áp dụng thay đổi.

