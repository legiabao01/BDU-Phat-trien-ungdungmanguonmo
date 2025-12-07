# Hướng dẫn Commit lên GitHub

## Repository: https://github.com/hangtr29/Web-vnl.git

### Các bước thực hiện:

1. **Mở PowerShell/Terminal và chuyển vào thư mục Webhoctructuyen:**

   **Cách 1: Sử dụng dấu ngoặc kép (khuyến nghị)**
   ```powershell
   cd "D:\Nhóm 6_Webhoctructuyen\Webhoctructuyen"
   ```

   **Cách 2: Sử dụng Set-Location với -LiteralPath**
   ```powershell
   Set-Location -LiteralPath "D:\Nhóm 6_Webhoctructuyen\Webhoctructuyen"
   ```

   **Cách 3: Sử dụng tab completion (gõ một phần tên rồi nhấn Tab)**
   ```powershell
   cd D:\Nh<nhấn Tab để tự động hoàn thành>
   ```

   **Cách 4: Kéo thả thư mục vào PowerShell**
   - Mở File Explorer, tìm thư mục `Webhoctructuyen`
   - Kéo thả thư mục vào cửa sổ PowerShell
   - PowerShell sẽ tự động chuyển vào thư mục đó

2. **Cấu hình Git Identity (QUAN TRỌNG - Phải làm trước khi commit):**
   
   **Cấu hình toàn cục (cho tất cả repositories):**
   ```bash
   git config --global user.name "Tên của bạn"
   git config --global user.email "email@example.com"
   ```
   
   **Hoặc chỉ cho repository này:**
   ```bash
   git config user.name "Tên của bạn"
   git config user.email "email@example.com"
   ```
   
   **Ví dụ:**
   ```bash
   git config --global user.name "Bao"
   git config --global user.email "bao@example.com"
   ```
   
   **Kiểm tra cấu hình:**
   ```bash
   git config --global user.name
   git config --global user.email
   ```

3. **Khởi tạo Git (nếu chưa có):**
   ```bash
   git init
   ```

4. **Thêm remote repository:**
   ```bash
   git remote add origin https://github.com/hangtr29/Web-vnl.git
   ```
   (Nếu đã có remote, cập nhật bằng: `git remote set-url origin https://github.com/hangtr29/Web-vnl.git`)

5. **Thêm tất cả file vào staging:**
   ```bash
   git add .
   ```

6. **Commit:**
   ```bash
   git commit -m "Add Webhoctructuyen project"
   ```

7. **Đặt tên branch (nếu cần):**
   ```bash
   git branch -M main
   ```

8. **Push lên GitHub:**
   ```bash
   git push -u origin main
   ```

### Hoặc chạy script tự động:

**Cách 1: Chạy file .bat (Dễ nhất - Double-click)**
- Mở File Explorer
- Tìm file `commit_to_github.bat` trong thư mục `Webhoctructuyen`
- Double-click vào file để chạy
- Script sẽ tự động thực hiện tất cả các bước

**Cách 2: Chạy file PowerShell**
```powershell
cd "D:\Nhóm 6_Webhoctructuyen\Webhoctructuyen"
.\commit_to_github.ps1
```

**Cách 3: Chạy từ File Explorer**
- Mở File Explorer, tìm thư mục `Webhoctructuyen`
- Kéo thả thư mục vào PowerShell
- Chạy: `.\commit_to_github.ps1` hoặc `.\commit_to_github.bat`

### Xử lý lỗi thường gặp:

**Lỗi: "src refspec main does not match any"**
- Nguyên nhân: Chưa có commit nào hoặc branch hiện tại không phải `main`
- Giải pháp:
  ```bash
  # Kiểm tra branch hiện tại
  git branch
  
  # Kiểm tra xem đã có commit chưa
  git log
  
  # Nếu chưa có commit, commit lại:
  git add .
  git commit -m "Add Webhoctructuyen project"
  
  # Đổi tên branch thành main (nếu đang ở master hoặc branch khác)
  git branch -M main
  
  # Sau đó push lại
  git push -u origin main
  ```

**Lỗi: "failed to push some refs"**
- Nếu repository trên GitHub đã có code, cần pull trước:
  ```bash
  git pull origin main --allow-unrelated-histories
  git push -u origin main
  ```

### Lưu ý:
- Nếu chưa đăng nhập GitHub, bạn sẽ cần Personal Access Token
- Luôn kiểm tra `git status` để xem trạng thái hiện tại

