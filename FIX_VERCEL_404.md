# 🔧 Sửa lỗi 404 và Deployment Failed trên Vercel

## Vấn đề

- Lỗi 404 NOT_FOUND khi truy cập frontend
- Deployment Failed trên Vercel

## Giải pháp

### Bước 1: Kiểm tra lỗi Deployment Failed

1. **Vào tab "Deployments"** (ở trên cùng)
2. **Tìm deployment có dấu X đỏ** (Failed)
3. **Click vào deployment đó**
4. **Xem logs** để biết lỗi cụ thể:
   - Scroll xuống phần "Build Logs"
   - Tìm dòng có "Error" hoặc "Failed"
   - Copy lỗi để xử lý

**Các lỗi thường gặp:**
- `npm install` failed → Kiểm tra `package.json`
- `npm run build` failed → Kiểm tra code có lỗi syntax không
- `Cannot find module` → Thiếu dependencies
- `Root Directory not found` → Cần set Root Directory

### Bước 2: Cấu hình Root Directory

1. **Vào Settings** (tab trên cùng)
2. **Click "Build & Development Settings"** (sidebar bên trái)
3. **Tìm phần "Root Directory"**
4. **Click "Edit"** hoặc "Change"
5. **Nhập:** `frontend`
6. **Save Changes**

**Nếu không thấy "Root Directory":**
- Có thể Vercel đã tự detect
- Kiểm tra Build Command có đúng không

### Bước 3: Kiểm tra Build Settings

Trong **Settings → Build & Development Settings**, đảm bảo:

- **Framework Preset:** `Vite` (hoặc để auto-detect)
- **Build Command:** `npm run build` (hoặc để Vercel tự detect)
- **Output Directory:** `dist`
- **Install Command:** `npm install` (hoặc để Vercel tự detect)

### Bước 4: Kiểm tra Environment Variables

1. **Vào Settings → Environment Variables**
2. **Đảm bảo có:**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://code-do-backend.onrender.com`
   - Environment: Tất cả (Production, Preview, Development)

### Bước 5: Redeploy

1. **Vào tab "Deployments"**
2. **Click "..."** trên deployment mới nhất
3. **Chọn "Redeploy"**
4. **Chọn "Rebuild"** (không dùng cache)
5. **Click "Redeploy"**
6. **Đợi build xong** (2-5 phút)

### Bước 6: Kiểm tra sau khi redeploy

1. **Xem status:**
   - "Ready" (màu xanh) → Thành công ✅
   - "Error" (màu đỏ) → Xem logs để biết lỗi

2. **Truy cập frontend:**
   - URL: `https://bdu-phat-trien-ungdungmanguonmo-delta.vercel.app`
   - Nếu thấy trang chủ → Thành công ✅
   - Nếu vẫn 404 → Kiểm tra lại Root Directory và vercel.json

## Troubleshooting

### Lỗi: "Root Directory not found"

**Giải pháp:**
1. Kiểm tra Root Directory trên Vercel = `frontend`
2. Đảm bảo thư mục `frontend/` có trong repository
3. Kiểm tra `frontend/package.json` có tồn tại không

### Lỗi: "Build Command failed"

**Giải pháp:**
1. Xem logs để biết lỗi cụ thể
2. Thử build local: `cd frontend && npm install && npm run build`
3. Nếu build local thành công → Vấn đề ở Vercel config
4. Nếu build local failed → Sửa lỗi code trước

### Lỗi: "Cannot find module"

**Giải pháp:**
1. Kiểm tra `package.json` có đầy đủ dependencies không
2. Thử xóa `node_modules` và `package-lock.json` (local)
3. Chạy `npm install` lại
4. Commit và push lại

### Lỗi: "Output Directory not found"

**Giải pháp:**
1. Kiểm tra Output Directory = `dist`
2. Đảm bảo `npm run build` tạo thư mục `dist/`
3. Kiểm tra `frontend/vite.config.js` có đúng không

## Checklist

- [ ] Đã kiểm tra logs của deployment failed
- [ ] Đã set Root Directory = `frontend`
- [ ] Đã kiểm tra Build Settings
- [ ] Đã set `VITE_API_BASE_URL` environment variable
- [ ] Đã redeploy với "Rebuild"
- [ ] Deployment status = "Ready"
- [ ] Frontend có thể truy cập được (không còn 404)

## Kiểm tra nhanh

Sau khi redeploy thành công:

1. **Truy cập:** `https://bdu-phat-trien-ungdungmanguonmo-delta.vercel.app`
2. **Kết quả mong đợi:**
   - Thấy trang chủ hoặc redirect đến `/courses`
   - Không còn lỗi 404
   - Có thể navigate giữa các trang

3. **Nếu vẫn 404:**
   - Mở Browser Console (F12)
   - Xem lỗi cụ thể
   - Kiểm tra Network tab xem request nào failed

---

**Lưu ý:** Nếu deployment vẫn failed sau khi đã sửa, hãy copy lỗi từ logs và gửi cho tôi để xử lý cụ thể.

