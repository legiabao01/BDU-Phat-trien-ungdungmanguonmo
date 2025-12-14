# BÁO CÁO TIỂU LUẬN
## MÔN: PHÁT TRIỂN ỨNG DỤNG MÃ NGUỒN MỞ

**Đề tài:** Hệ thống học trực tuyến (E-Learning System)

**Giảng viên:** Lê Duy Hùng

**Sinh viên:** [Tên sinh viên]

**Ngày nộp:** [Ngày tháng năm]

---

## 1. GIỚI THIỆU HỆ THỐNG (0.5 điểm)

### 1.1. Giới thiệu về hệ thống

**Hệ thống học trực tuyến (E-Learning System)** là một nền tảng web cho phép học viên tham gia các khóa học trực tuyến, giáo viên quản lý khóa học và bài giảng, và quản trị viên quản lý toàn bộ hệ thống.

Hệ thống được xây dựng với mục tiêu:
- Cung cấp môi trường học tập trực tuyến hiện đại, dễ sử dụng
- Hỗ trợ đầy đủ các chức năng: xem video bài giảng, làm bài tập, thảo luận, theo dõi tiến độ
- Quản lý thanh toán và ví điện tử tích hợp
- Cấp chứng nhận hoàn thành khóa học tự động

### 1.2. Giới thiệu chức năng và công nghệ sử dụng

#### 1.2.1. Chức năng chính

**Cho Học viên (Student):**
- Đăng ký/Đăng nhập tài khoản
- Xem danh sách khóa học, tìm kiếm và lọc khóa học
- Đăng ký khóa học (miễn phí hoặc trả phí)
- Xem video bài giảng, tài liệu học tập
- Làm bài tập và nộp bài
- Tham gia thảo luận trong forum
- Theo dõi tiến độ học tập
- Nhận chứng nhận hoàn thành khóa học
- Quản lý ví điện tử, nạp tiền và thanh toán

**Cho Giáo viên (Teacher):**
- Tạo và quản lý khóa học
- Tạo bài học, video, tài liệu
- Tạo và chấm bài tập
- Xem thống kê học viên, tiến độ học tập
- Quản lý thảo luận trong khóa học
- Xem danh sách bài tập cần chấm

**Cho Quản trị viên (Admin):**
- Quản lý người dùng (thêm, sửa, xóa)
- Duyệt khóa học mới
- Quản lý thanh toán và giao dịch
- Xem thống kê tổng quan hệ thống
- Quản lý doanh thu

#### 1.2.2. Công nghệ sử dụng

**Backend:**
- **FastAPI**: Framework Python hiện đại, hiệu suất cao, tự động tạo API documentation
- **PostgreSQL**: Hệ quản trị cơ sở dữ liệu quan hệ, mạnh mẽ và ổn định
- **SQLAlchemy**: ORM (Object-Relational Mapping) cho Python
- **Pydantic**: Validation và serialization dữ liệu
- **JWT (JSON Web Tokens)**: Xác thực người dùng
- **Python 3.8+**: Ngôn ngữ lập trình backend

**Frontend:**
- **React 18**: Thư viện JavaScript cho xây dựng giao diện người dùng
- **Vite**: Build tool nhanh và hiện đại
- **React Router DOM**: Điều hướng trang
- **Axios**: HTTP client để gọi API
- **Bootstrap 5**: Framework CSS cho responsive design
- **Custom CSS**: Styling tùy chỉnh

**Database:**
- **PostgreSQL 12+**: Hệ quản trị cơ sở dữ liệu
- **SQL Scripts**: Migration và seed data

**Deployment:**
- **Render**: Hosting backend (FastAPI)
- **Vercel**: Hosting frontend (React)
- **GitHub**: Quản lý mã nguồn

### 1.3. Kế hoạch triển khai

**Giai đoạn 1: Phân tích và thiết kế (Tuần 1-2)**
- Phân tích yêu cầu hệ thống
- Thiết kế database schema
- Thiết kế API endpoints
- Thiết kế giao diện người dùng

**Giai đoạn 2: Phát triển Backend (Tuần 3-5)**
- Setup FastAPI project
- Tạo database models
- Xây dựng API endpoints
- Implement authentication và authorization
- Testing API

**Giai đoạn 3: Phát triển Frontend (Tuần 6-8)**
- Setup React project với Vite
- Xây dựng các trang chính
- Tích hợp với Backend API
- Implement authentication flow
- Testing giao diện

**Giai đoạn 4: Tích hợp và tối ưu (Tuần 9-10)**
- Tích hợp thanh toán
- Tối ưu video streaming
- Cải thiện UX/UI
- Testing toàn hệ thống

**Giai đoạn 5: Deploy và hoàn thiện (Tuần 11-12)**
- Deploy backend lên Render
- Deploy frontend lên Vercel
- Chạy migrations trên production
- Testing production environment
- Hoàn thiện tài liệu

---

## 2. MÔ HÌNH KIẾN TRÚC, PHÂN TÍCH KIẾN TRÚC HỆ THỐNG (1 điểm)

### 2.1. Căn cứ các chức năng đã nêu, liệt kê và thông tin chi tiết

#### 2.1.1. Module Authentication (Xác thực)
- **Đăng ký tài khoản**: Tạo tài khoản mới với email, mật khẩu, họ tên
- **Đăng nhập**: Xác thực người dùng, trả về JWT token
- **Quản lý phiên đăng nhập**: Refresh token, logout
- **Phân quyền**: Student, Teacher, Admin

#### 2.1.2. Module Quản lý Khóa học (Course Management)
- **Danh sách khóa học**: Hiển thị tất cả khóa học, tìm kiếm, lọc
- **Chi tiết khóa học**: Thông tin khóa học, giá, giáo viên
- **Tạo khóa học**: Giáo viên/Admin tạo khóa học mới
- **Duyệt khóa học**: Admin duyệt khóa học chờ phê duyệt
- **Quản lý trạng thái**: Active, Inactive, Pending

#### 2.1.3. Module Quản lý Bài học (Lesson Management)
- **Danh sách bài học**: Hiển thị các bài học trong khóa học
- **Chi tiết bài học**: Video, tài liệu, mô tả
- **Tạo bài học**: Giáo viên tạo bài học mới
- **Drip content**: Khóa/mở khóa bài học theo tiến độ
- **Tài liệu đính kèm**: PDF, file tài liệu

#### 2.1.4. Module Đăng ký Khóa học (Enrollment)
- **Đăng ký khóa học**: Học viên đăng ký khóa học
- **Kiểm tra đăng ký**: Kiểm tra đã đăng ký chưa
- **Danh sách khóa học đã đăng ký**: Dashboard học viên
- **Trạng thái đăng ký**: Active, Completed, Cancelled

#### 2.1.5. Module Bài tập (Assignments)
- **Tạo bài tập**: Giáo viên tạo bài tập cho khóa học
- **Danh sách bài tập**: Hiển thị bài tập trong khóa học
- **Nộp bài**: Học viên nộp bài tập (file upload)
- **Chấm bài**: Giáo viên chấm điểm và nhận xét
- **Xem điểm**: Học viên xem điểm và nhận xét

#### 2.1.6. Module Thảo luận (Discussion Forum)
- **Tạo thảo luận**: Học viên/Giáo viên tạo chủ đề thảo luận
- **Trả lời thảo luận**: Comment, reply
- **Upload hình ảnh**: Đính kèm hình ảnh trong thảo luận
- **Quản lý thảo luận**: Xóa, chỉnh sửa

#### 2.1.7. Module Theo dõi Tiến độ (Progress Tracking)
- **Cập nhật tiến độ**: Tự động khi hoàn thành bài học
- **Xem tiến độ**: Progress bar, phần trăm hoàn thành
- **Lịch sử học tập**: Xem lại các bài đã học

#### 2.1.8. Module Chứng nhận (Certificates)
- **Tạo chứng nhận**: Tự động khi hoàn thành khóa học
- **Xem chứng nhận**: Download PDF chứng nhận
- **Xác thực chứng nhận**: Kiểm tra tính hợp lệ

#### 2.1.9. Module Thanh toán (Payment)
- **Tạo thanh toán**: Tạo link thanh toán cho khóa học
- **Callback thanh toán**: Xử lý kết quả thanh toán
- **Lịch sử thanh toán**: Xem các giao dịch đã thực hiện
- **Thanh toán bằng ví**: Sử dụng số dư ví điện tử

#### 2.1.10. Module Ví điện tử (Wallet)
- **Xem số dư**: Kiểm tra số dư hiện tại
- **Nạp tiền**: Tạo yêu cầu nạp tiền
- **Duyệt nạp tiền**: Admin duyệt yêu cầu nạp tiền
- **Thanh toán bằng ví**: Trừ tiền từ ví khi mua khóa học
- **Lịch sử giao dịch**: Xem tất cả giao dịch

#### 2.1.11. Module Thông báo (Notifications)
- **Tạo thông báo**: Hệ thống tạo thông báo tự động
- **Danh sách thông báo**: Xem tất cả thông báo
- **Đánh dấu đã đọc**: Mark as read
- **Đếm thông báo chưa đọc**: Badge số lượng

#### 2.1.12. Module Tin nhắn (Messages)
- **Gửi tin nhắn**: Chat giữa người dùng
- **Danh sách cuộc trò chuyện**: Xem các cuộc trò chuyện
- **Đánh dấu đã đọc**: Mark message as read
- **Đếm tin nhắn chưa đọc**: Badge số lượng

#### 2.1.13. Module Quiz (Câu hỏi trắc nghiệm)
- **Tạo quiz**: Giáo viên tạo câu hỏi trắc nghiệm
- **Làm quiz**: Học viên làm bài quiz
- **Chấm điểm tự động**: Tự động tính điểm
- **Xem kết quả**: Xem điểm và đáp án đúng

#### 2.1.14. Module Đánh giá (Reviews)
- **Tạo đánh giá**: Học viên đánh giá khóa học
- **Xem đánh giá**: Xem tất cả đánh giá của khóa học
- **Thống kê đánh giá**: Điểm trung bình, số lượng đánh giá

#### 2.1.15. Module Thống kê (Statistics)
- **Thống kê giáo viên**: Số khóa học, số học viên, doanh thu
- **Thống kê admin**: Tổng quan hệ thống, doanh thu theo khóa học
- **Thống kê học viên**: Tiến độ học tập, số khóa học đã học

### 2.2. Vẽ mô hình tổng quát hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                    React Frontend (Vercel)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Student    │  │   Teacher    │  │    Admin     │          │
│  │   Pages     │  │   Pages      │  │    Pages     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    API GATEWAY (FastAPI)                          │
│                    Backend (Render)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API Routes                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  Auth    │  │ Courses  │  │Payment  │  │  Wallet  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │Assignments│ │Discussion│ │ Progress │ │Messages │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                          │   │
│  │  - Authentication & Authorization                         │   │
│  │  - Data Validation (Pydantic)                             │   │
│  │  - Business Rules                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Data Access Layer (SQLAlchemy)                │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ SQL Connection
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│                    Render PostgreSQL                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Users     │  │   Courses    │  │  Payments    │          │
│  │  Enrollments │  │   Lessons    │  │  Deposits    │          │
│  │  Assignments │  │ Discussions  │  │  Messages    │          │
│  │   Progress   │  │  Certificates│  │ Notifications│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

**Mô tả kiến trúc:**
- **Client Layer**: React frontend chạy trên Vercel, giao tiếp với backend qua REST API
- **API Gateway**: FastAPI backend chạy trên Render, xử lý tất cả requests
- **Business Logic Layer**: Xử lý logic nghiệp vụ, validation, authentication
- **Data Access Layer**: SQLAlchemy ORM để tương tác với database
- **Database Layer**: PostgreSQL lưu trữ dữ liệu

---

## 3. MÔ TẢ QUY TRÌNH PHÂN TÍCH NGHIỆP VỤ/CHỨC NĂNG + API PLANNING (1 điểm)

### 3.1. Quy trình đăng ký và đăng nhập

**Quy trình đăng ký:**
1. Người dùng điền form đăng ký (email, mật khẩu, họ tên, số điện thoại)
2. Frontend gửi POST request đến `/api/auth/register`
3. Backend validate dữ liệu (email format, password strength)
4. Backend kiểm tra email đã tồn tại chưa
5. Backend hash mật khẩu bằng bcrypt
6. Backend tạo user mới trong database với role = "student"
7. Backend trả về thông tin user (không có password)
8. Frontend chuyển hướng đến trang đăng nhập

**Quy trình đăng nhập:**
1. Người dùng điền email và mật khẩu
2. Frontend gửi POST request đến `/api/auth/login`
3. Backend tìm user theo email
4. Backend verify mật khẩu
5. Backend tạo JWT access token và refresh token
6. Backend trả về tokens và thông tin user
7. Frontend lưu tokens vào localStorage
8. Frontend chuyển hướng đến dashboard theo role

**API Endpoints:**
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập

### 3.2. Quy trình đăng ký khóa học

**Quy trình:**
1. Học viên xem danh sách khóa học
2. Học viên click vào khóa học để xem chi tiết
3. Học viên click "Đăng ký khóa học"
4. Nếu khóa học trả phí:
   - Frontend hiển thị form thanh toán
   - Học viên chọn phương thức thanh toán (Ví điện tử hoặc QR Code)
   - Nếu chọn ví: Kiểm tra số dư, trừ tiền
   - Nếu chọn QR: Tạo link thanh toán
5. Frontend gửi POST request đến `/api/courses/{course_id}/enroll`
6. Backend kiểm tra user đã đăng ký chưa
7. Backend kiểm tra khóa học có tồn tại và active không
8. Backend tạo enrollment record
9. Backend trả về thông tin enrollment
10. Frontend hiển thị thông báo thành công và chuyển hướng đến trang học

**API Endpoints:**
- `GET /api/courses` - Danh sách khóa học
- `GET /api/courses/{course_id}` - Chi tiết khóa học
- `POST /api/courses/{course_id}/enroll` - Đăng ký khóa học
- `GET /api/courses/{course_id}/enrollment` - Kiểm tra đã đăng ký

### 3.3. Quy trình học tập

**Quy trình:**
1. Học viên vào trang khóa học đã đăng ký
2. Frontend gửi GET request đến `/api/courses/{course_id}/lessons`
3. Backend trả về danh sách bài học (có thông tin locked/unlocked)
4. Học viên click vào bài học
5. Frontend gửi GET request đến `/api/lessons/{lesson_id}`
6. Backend trả về chi tiết bài học (video URL, tài liệu, mô tả)
7. Học viên xem video và tài liệu
8. Khi hoàn thành bài học, Frontend gửi POST request đến `/api/courses/{course_id}/progress`
9. Backend cập nhật tiến độ học tập
10. Backend tự động unlock bài học tiếp theo (nếu có)
11. Backend kiểm tra nếu hoàn thành 100% → tạo certificate

**API Endpoints:**
- `GET /api/courses/{course_id}/lessons` - Danh sách bài học
- `GET /api/lessons/{lesson_id}` - Chi tiết bài học
- `POST /api/courses/{course_id}/progress` - Cập nhật tiến độ
- `GET /api/courses/{course_id}/progress` - Lấy tiến độ
- `GET /api/courses/{course_id}/certificate` - Lấy chứng nhận

### 3.4. Quy trình làm bài tập

**Quy trình:**
1. Giáo viên tạo bài tập:
   - Vào trang quản lý khóa học
   - Click "Tạo bài tập"
   - Điền thông tin: tiêu đề, mô tả, hạn nộp, điểm tối đa
   - Frontend gửi POST request đến `/api/courses/{course_id}/assignments`
   - Backend tạo assignment record

2. Học viên xem và nộp bài:
   - Vào trang khóa học → Tab "Bài tập"
   - Frontend gửi GET request đến `/api/courses/{course_id}/assignments`
   - Backend trả về danh sách bài tập
   - Học viên click vào bài tập để xem chi tiết
   - Học viên upload file bài làm
   - Frontend gửi POST request đến `/api/assignments/{assignment_id}/submit` với FormData
   - Backend lưu file và tạo submission record

3. Giáo viên chấm bài:
   - Vào Dashboard → "Bài tập cần chấm"
   - Frontend gửi GET request đến `/api/teachers/me/pending-submissions`
   - Backend trả về danh sách bài nộp chưa chấm
   - Giáo viên xem bài nộp và chấm điểm
   - Frontend gửi POST request đến `/api/submissions/{submission_id}/grade`
   - Backend cập nhật điểm và nhận xét

**API Endpoints:**
- `GET /api/courses/{course_id}/assignments` - Danh sách bài tập
- `POST /api/courses/{course_id}/assignments` - Tạo bài tập
- `POST /api/assignments/{assignment_id}/submit` - Nộp bài
- `GET /api/assignments/{assignment_id}/submissions` - Danh sách bài nộp
- `POST /api/submissions/{submission_id}/grade` - Chấm bài

### 3.5. Quy trình thảo luận

**Quy trình:**
1. Học viên/Giáo viên tạo chủ đề thảo luận:
   - Vào trang khóa học → Tab "Thảo luận"
   - Click "Tạo thảo luận"
   - Điền tiêu đề, nội dung, upload hình (nếu có)
   - Frontend gửi POST request đến `/api/courses/{course_id}/discussions` với FormData
   - Backend lưu discussion và hình ảnh

2. Xem và trả lời thảo luận:
   - Frontend gửi GET request đến `/api/courses/{course_id}/discussions`
   - Backend trả về danh sách thảo luận (có phân trang)
   - Người dùng click vào thảo luận để xem chi tiết và trả lời
   - Frontend gửi POST request để tạo reply

**API Endpoints:**
- `GET /api/courses/{course_id}/discussions` - Danh sách thảo luận
- `POST /api/courses/{course_id}/discussions` - Tạo thảo luận
- `DELETE /api/discussions/{discussion_id}` - Xóa thảo luận

### 3.6. Quy trình thanh toán và ví điện tử

**Quy trình nạp tiền:**
1. Học viên vào trang "Ví của tôi"
2. Click "Nạp tiền"
3. Điền số tiền và nội dung chuyển khoản
4. Frontend gửi POST request đến `/api/wallet/add-funds`
5. Backend tạo deposit transaction với trạng thái "pending"
6. Backend trả về thông tin chuyển khoản (số tài khoản, nội dung)
7. Học viên chuyển khoản theo thông tin
8. Admin duyệt yêu cầu nạp tiền:
   - Vào trang quản lý → "Quản lý tiền"
   - Xem danh sách yêu cầu nạp tiền chờ duyệt
   - Click "Duyệt" hoặc "Từ chối"
   - Frontend gửi POST request đến `/api/admin/deposits/{transaction_id}/approve`
   - Backend cập nhật số dư ví và trạng thái transaction

**Quy trình thanh toán:**
1. Học viên chọn khóa học trả phí
2. Click "Thanh toán"
3. Chọn phương thức: "Ví điện tử" hoặc "QR Code"
4. Nếu chọn ví:
   - Frontend gửi POST request đến `/api/payments/buy-with-wallet`
   - Backend kiểm tra số dư
   - Backend trừ tiền từ ví
   - Backend tạo payment record và enrollment
5. Nếu chọn QR Code:
   - Frontend gửi POST request đến `/api/payments/create`
   - Backend tạo payment link
   - Học viên quét QR và thanh toán
   - Payment gateway gọi callback
   - Backend xử lý và tạo enrollment

**API Endpoints:**
- `GET /api/wallet/balance` - Xem số dư
- `POST /api/wallet/add-funds` - Tạo yêu cầu nạp tiền
- `GET /api/admin/deposits/pending` - Danh sách nạp tiền chờ duyệt
- `POST /api/admin/deposits/{transaction_id}/approve` - Duyệt nạp tiền
- `POST /api/payments/create` - Tạo thanh toán
- `POST /api/payments/buy-with-wallet` - Thanh toán bằng ví

### 3.7. API Planning Summary

**Authentication APIs:**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

**Course APIs:**
- `GET /api/courses` - Danh sách khóa học
- `GET /api/courses/{id}` - Chi tiết khóa học
- `POST /api/courses` - Tạo khóa học
- `PUT /api/admin/courses/{id}/approve` - Duyệt khóa học

**Enrollment APIs:**
- `POST /api/courses/{id}/enroll` - Đăng ký khóa học
- `GET /api/users/me/enrollments` - Khóa học đã đăng ký

**Lesson APIs:**
- `GET /api/courses/{id}/lessons` - Danh sách bài học
- `GET /api/lessons/{id}` - Chi tiết bài học

**Assignment APIs:**
- `GET /api/courses/{id}/assignments` - Danh sách bài tập
- `POST /api/courses/{id}/assignments` - Tạo bài tập
- `POST /api/assignments/{id}/submit` - Nộp bài
- `POST /api/submissions/{id}/grade` - Chấm bài

**Discussion APIs:**
- `GET /api/courses/{id}/discussions` - Danh sách thảo luận
- `POST /api/courses/{id}/discussions` - Tạo thảo luận

**Payment & Wallet APIs:**
- `GET /api/wallet/balance` - Số dư ví
- `POST /api/wallet/add-funds` - Nạp tiền
- `POST /api/payments/create` - Tạo thanh toán
- `POST /api/payments/buy-with-wallet` - Thanh toán bằng ví

**Xem đầy đủ API documentation tại:** `https://code-do-backend.onrender.com/docs`

---

## 4. MÔ TẢ THIẾT KẾ GIAO DIỆN BAN ĐẦU (0.5 điểm)

### 4.1. Trang chủ (Homepage)

**Thiết kế:**
- **Header**: Logo "Code Đơ", menu điều hướng (Khóa học, Giới thiệu, Liên hệ), nút "Số dư", nút "Đăng nhập/Đăng ký"
- **Hero Section**: Tiêu đề lớn, mô tả ngắn, nút "Bắt đầu học ngay"
- **Thống kê**: Số khóa học, số học viên, số giáo viên
- **Tính năng nổi bật**: 3-4 card giới thiệu tính năng chính
- **Khóa học nổi bật**: Carousel hiển thị các khóa học phổ biến
- **Footer**: Thông tin liên hệ, mạng xã hội, links hữu ích

**Màu sắc:**
- Màu chủ đạo: Xanh dương (#2563eb)
- Màu phụ: Trắng, xám nhạt
- Màu accent: Vàng (#fbbf24)

### 4.2. Trang danh sách khóa học

**Thiết kế:**
- **Sidebar bên trái**: Bộ lọc (Danh mục, Giá, Đánh giá)
- **Nội dung chính**: Grid layout hiển thị cards khóa học
- **Mỗi card khóa học**: Hình ảnh, tiêu đề, giáo viên, giá, đánh giá, nút "Xem chi tiết"
- **Thanh tìm kiếm**: Ở trên cùng, có thể tìm theo tên khóa học
- **Phân trang**: Ở cuối trang

### 4.3. Trang chi tiết khóa học

**Thiết kế:**
- **Phần trên**: Hình ảnh khóa học lớn, tiêu đề, mô tả ngắn, thông tin giáo viên
- **Tabs**: "Tổng quan", "Nội dung khóa học", "Đánh giá", "Thảo luận"
- **Tab Tổng quan**: Mô tả chi tiết, mục tiêu khóa học, yêu cầu
- **Tab Nội dung**: Danh sách bài học (tree structure), thời lượng
- **Tab Đánh giá**: Danh sách đánh giá của học viên, điểm trung bình
- **Tab Thảo luận**: Forum thảo luận
- **Sidebar bên phải**: Giá khóa học, nút "Đăng ký ngay", thông tin khóa học

### 4.4. Trang học tập (Learn Page)

**Thiết kế:**
- **Sidebar trái**: Danh sách bài học (tree structure), hiển thị locked/unlocked, progress bar
- **Nội dung chính**: 
  - Video player (YouTube embed hoặc HTML5)
  - Mô tả bài học
  - Tài liệu đính kèm (download)
  - Nút "Đánh dấu hoàn thành"
- **Tabs**: "Bài học", "Bài tập", "Thảo luận"
- **Tab Bài tập**: Danh sách bài tập, form nộp bài
- **Tab Thảo luận**: Forum thảo luận của khóa học

### 4.5. Dashboard Học viên

**Thiết kế:**
- **Header**: Welcome message, thông tin user
- **Cards thống kê**: Số khóa học đã đăng ký, số khóa học đã hoàn thành, số chứng nhận
- **Khóa học đang học**: Grid hiển thị các khóa học đang học, progress bar
- **Khóa học đã hoàn thành**: Danh sách khóa học đã hoàn thành, có thể download certificate
- **Bài tập gần hết hạn**: Danh sách bài tập cần nộp sớm

### 4.6. Dashboard Giáo viên

**Thiết kế:**
- **Header**: Thống kê tổng quan (số khóa học, số học viên, doanh thu)
- **Khóa học của tôi**: Danh sách khóa học đã tạo, có thể tạo mới
- **Bài tập cần chấm**: Danh sách bài nộp chưa chấm, có thể chấm ngay
- **Học viên**: Danh sách học viên trong các khóa học

### 4.7. Dashboard Admin

**Thiết kế:**
- **Header**: Thống kê tổng quan hệ thống
- **Tabs**: "Quản lý người dùng", "Quản lý khóa học", "Quản lý tiền", "Thống kê"
- **Tab Quản lý người dùng**: Bảng danh sách users, có thể thêm/sửa/xóa
- **Tab Quản lý khóa học**: Danh sách khóa học chờ duyệt, có thể duyệt/từ chối
- **Tab Quản lý tiền**: Danh sách yêu cầu nạp tiền chờ duyệt, doanh thu
- **Tab Thống kê**: Biểu đồ doanh thu, thống kê khóa học

### 4.8. Trang Ví điện tử

**Thiết kế:**
- **Phần trên**: Hiển thị số dư lớn, nút "Nạp tiền"
- **Tab "Nạp tiền"**: Form điền số tiền, hiển thị thông tin chuyển khoản
- **Tab "Lịch sử"**: Bảng lịch sử giao dịch (nạp tiền, thanh toán)

### 4.9. Responsive Design

- **Desktop**: Full layout với sidebar
- **Tablet**: Sidebar collapse thành menu
- **Mobile**: Hamburger menu, single column layout

**Công cụ thiết kế:** Bootstrap 5 + Custom CSS
**Prototype:** Có thể sử dụng Figma để thiết kế wireframe ban đầu

---

## 5. KẾT QUẢ XÂY DỰNG HỆ THỐNG (7 điểm)

### 5.1. Nộp code đầy đủ mã nguồn + Code phải được push lên Github (1 điểm)

**Repository GitHub:**
- **URL**: `https://github.com/legiabao01/BDU-Phat-trien-ungdungmanguonmo`
- **Branch chính**: `main`
- **Commit history**: Đầy đủ, có commit messages rõ ràng

**Cấu trúc mã nguồn:**
```
BDU-Phat-trien-ungdungmanguonmo/
├── fastapi_app/              # Backend FastAPI
│   ├── main.py              # Entry point
│   ├── requirements.txt     # Dependencies
│   ├── core/                # Config, security
│   ├── db/                  # Database
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── api/routes/          # API endpoints (22 files)
├── frontend/                # Frontend React
│   ├── src/
│   │   ├── pages/           # 14 page components
│   │   ├── components/      # 12 reusable components
│   │   ├── context/         # Auth context
│   │   └── styles/          # CSS files
│   ├── package.json
│   └── vite.config.js
├── database/                # SQL scripts (17 files)
│   ├── schema_pg.sql
│   ├── create_*.sql
│   └── seed_*.sql
├── scripts/                 # Automation scripts
├── docs/                    # Documentation
├── README.md                # Main documentation
└── vercel.json, render.yaml # Deployment configs
```

**Tổng số file:**
- Backend: 50+ Python files
- Frontend: 25+ JSX/CSS files
- Database: 17 SQL files
- Documentation: 10+ MD files

### 5.2. README.md (1 điểm)

**README.md đã được tạo đầy đủ với các nội dung:**

1. **Tổng quan dự án**: Mô tả hệ thống học trực tuyến
2. **Tình hình hiện tại**: Danh sách tính năng đã hoàn thành
3. **Công nghệ sử dụng**: Backend, Frontend, Database
4. **Cách chạy dự án**: Hướng dẫn chi tiết từng bước
   - Yêu cầu hệ thống
   - Setup Backend
   - Setup Frontend
   - Setup Database
5. **Cấu trúc dự án**: Mô tả cấu trúc thư mục
6. **API Endpoints**: Liệt kê các API chính
7. **Tài khoản test**: Thông tin đăng nhập các role
8. **Troubleshooting**: Hướng dẫn xử lý lỗi thường gặp
9. **Tài liệu tham khảo**: Links đến documentation

**File README.md có:**
- ✅ Đầy đủ thông tin
- ✅ Rõ ràng, dễ hiểu
- ✅ Có ví dụ code
- ✅ Có hướng dẫn chi tiết
- ✅ Format markdown đẹp

**Xem file:** `README.md` trong repository

### 5.3. Chức năng chương trình (4 điểm)

#### 5.3.1. Chạy chính xác, đầy đủ các chức năng đã nêu

**✅ Đã hoàn thành các chức năng:**

**Authentication:**
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập/Đăng xuất
- ✅ JWT token authentication
- ✅ Phân quyền theo role (Student, Teacher, Admin)

**Quản lý Khóa học:**
- ✅ Xem danh sách khóa học (có search, filter)
- ✅ Xem chi tiết khóa học
- ✅ Tạo khóa học (Teacher/Admin)
- ✅ Duyệt khóa học (Admin)
- ✅ Quản lý trạng thái khóa học

**Quản lý Bài học:**
- ✅ Xem danh sách bài học
- ✅ Xem chi tiết bài học (video, tài liệu)
- ✅ Tạo bài học (Teacher)
- ✅ Drip content (lock/unlock bài học)
- ✅ Upload tài liệu

**Đăng ký Khóa học:**
- ✅ Đăng ký khóa học (miễn phí/trả phí)
- ✅ Kiểm tra đã đăng ký
- ✅ Xem khóa học đã đăng ký
- ✅ Quản lý enrollment

**Bài tập:**
- ✅ Tạo bài tập (Teacher)
- ✅ Xem danh sách bài tập
- ✅ Nộp bài tập (upload file)
- ✅ Chấm bài tập (Teacher)
- ✅ Xem điểm và nhận xét

**Thảo luận:**
- ✅ Tạo thảo luận
- ✅ Trả lời thảo luận
- ✅ Upload hình ảnh trong thảo luận
- ✅ Xóa thảo luận

**Theo dõi Tiến độ:**
- ✅ Cập nhật tiến độ tự động
- ✅ Xem progress bar
- ✅ Xem phần trăm hoàn thành
- ✅ Lịch sử học tập

**Chứng nhận:**
- ✅ Tạo chứng nhận tự động khi hoàn thành
- ✅ Xem và download chứng nhận
- ✅ Xác thực chứng nhận

**Thanh toán:**
- ✅ Tạo link thanh toán
- ✅ Thanh toán bằng ví điện tử
- ✅ Thanh toán bằng QR Code
- ✅ Lịch sử thanh toán

**Ví điện tử:**
- ✅ Xem số dư
- ✅ Nạp tiền (tạo yêu cầu)
- ✅ Duyệt nạp tiền (Admin)
- ✅ Lịch sử giao dịch

**Thông báo:**
- ✅ Tạo thông báo tự động
- ✅ Xem danh sách thông báo
- ✅ Đánh dấu đã đọc
- ✅ Đếm thông báo chưa đọc

**Tin nhắn:**
- ✅ Gửi tin nhắn giữa users
- ✅ Xem danh sách cuộc trò chuyện
- ✅ Đánh dấu đã đọc
- ✅ Đếm tin nhắn chưa đọc

**Quiz:**
- ✅ Tạo quiz (Teacher)
- ✅ Làm quiz (Student)
- ✅ Chấm điểm tự động
- ✅ Xem kết quả

**Đánh giá:**
- ✅ Tạo đánh giá khóa học
- ✅ Xem đánh giá
- ✅ Thống kê đánh giá

**Thống kê:**
- ✅ Thống kê giáo viên
- ✅ Thống kê admin
- ✅ Thống kê học viên

**Video Streaming:**
- ✅ Stream video từ URL
- ✅ Hỗ trợ YouTube, Vimeo, HTML5
- ✅ HTTP Range Request support
- ✅ Lazy loading

#### 5.3.2. Hiểu/trình bày hệ thống và vấn đáp

**Hệ thống đã được triển khai và test đầy đủ:**
- ✅ Backend deploy trên Render: `https://code-do-backend.onrender.com`
- ✅ Frontend deploy trên Vercel: `https://code-do-frontend.vercel.app`
- ✅ Database trên Render PostgreSQL
- ✅ Tất cả API endpoints hoạt động
- ✅ Giao diện responsive, đẹp mắt
- ✅ Các chức năng đã test và hoạt động tốt

**Có thể trình bày:**
- Kiến trúc hệ thống
- Quy trình hoạt động
- Công nghệ sử dụng
- Các tính năng chính
- Cách deploy và vận hành

### 5.4. Coding convention (1 điểm)

#### 5.4.1. Tuân thủ quy tắc đặt tên

**Backend (Python):**
- ✅ **Files**: snake_case (`user.py`, `course_content.py`)
- ✅ **Classes**: PascalCase (`User`, `CourseContent`, `DepositTransaction`)
- ✅ **Functions**: snake_case (`get_user`, `create_course`)
- ✅ **Variables**: snake_case (`user_id`, `course_name`)
- ✅ **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`, `DATABASE_URL`)

**Frontend (JavaScript/React):**
- ✅ **Files**: PascalCase cho components (`Login.jsx`, `CourseCard.jsx`)
- ✅ **Components**: PascalCase (`Login`, `CourseCard`, `PaymentModal`)
- ✅ **Functions**: camelCase (`handleSubmit`, `fetchCourses`)
- ✅ **Variables**: camelCase (`userName`, `courseList`)
- ✅ **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

**Database:**
- ✅ **Tables**: snake_case (`users`, `khoa_hoc`, `dang_ky_khoa_hoc`)
- ✅ **Columns**: snake_case (`user_id`, `created_at`, `so_du`)

#### 5.4.2. Tuân thủ quy tắc định dạng

**Backend:**
- ✅ Sử dụng Black formatter (hoặc PEP 8)
- ✅ Indentation: 4 spaces
- ✅ Line length: Tối đa 100-120 characters
- ✅ Import statements: Sắp xếp theo thứ tự (standard library, third-party, local)

**Frontend:**
- ✅ Indentation: 2 spaces
- ✅ Sử dụng Prettier (nếu có)
- ✅ JSX formatting: Đúng cấu trúc
- ✅ Consistent spacing

#### 5.4.3. Tuân thủ quy tắc comment

**Backend:**
- ✅ **Docstrings**: Mô tả functions, classes
- ✅ **Inline comments**: Giải thích logic phức tạp
- ✅ **Type hints**: Sử dụng type hints cho parameters và return types

**Ví dụ:**
```python
def get_user_by_id(user_id: int, db: Session) -> Optional[User]:
    """
    Lấy thông tin user theo ID.
    
    Args:
        user_id: ID của user
        db: Database session
        
    Returns:
        User object nếu tìm thấy, None nếu không
    """
    return db.query(User).filter(User.id == user_id).first()
```

**Frontend:**
- ✅ **Function comments**: Mô tả chức năng của functions
- ✅ **Component comments**: Mô tả props và usage
- ✅ **Inline comments**: Giải thích logic phức tạp

**Ví dụ:**
```javascript
/**
 * Component hiển thị danh sách khóa học
 * @param {Array} courses - Danh sách khóa học
 * @param {Function} onEnroll - Callback khi đăng ký khóa học
 */
const CourseList = ({ courses, onEnroll }) => {
  // Logic here
}
```

**Database:**
- ✅ **SQL comments**: Mô tả tables, columns trong schema
- ✅ **Migration comments**: Mô tả mục đích của migration

### 5.5. Triển khai thực tế (Ảnh chụp demo trong báo cáo và thực tế)

#### 5.5.1. Ảnh chụp hệ thống thực tế

**Các ảnh chụp cần có:**

1. **Trang chủ (Homepage)**
   - URL: `https://code-do-frontend.vercel.app`
   - Screenshot: Hero section, thống kê, khóa học nổi bật

2. **Trang danh sách khóa học**
   - URL: `https://code-do-frontend.vercel.app/courses`
   - Screenshot: Grid layout, search bar, filter

3. **Trang chi tiết khóa học**
   - URL: `https://code-do-frontend.vercel.app/courses/{id}`
   - Screenshot: Thông tin khóa học, tabs, nút đăng ký

4. **Trang học tập**
   - URL: `https://code-do-frontend.vercel.app/learn/{course_id}`
   - Screenshot: Video player, sidebar bài học, progress bar

5. **Dashboard Học viên**
   - URL: `https://code-do-frontend.vercel.app/dashboard`
   - Screenshot: Thống kê, khóa học đang học, progress

6. **Dashboard Giáo viên**
   - URL: `https://code-do-frontend.vercel.app/teacher/dashboard`
   - Screenshot: Thống kê, khóa học, bài tập cần chấm

7. **Dashboard Admin**
   - URL: `https://code-do-frontend.vercel.app/admin/dashboard`
   - Screenshot: Quản lý users, khóa học, thanh toán

8. **Trang Ví điện tử**
   - URL: `https://code-do-frontend.vercel.app/wallet`
   - Screenshot: Số dư, form nạp tiền, lịch sử

9. **API Documentation (Swagger UI)**
   - URL: `https://code-do-backend.onrender.com/docs`
   - Screenshot: Danh sách API endpoints

10. **Deployment trên Render và Vercel**
    - Screenshot: Render Dashboard (Backend service)
    - Screenshot: Vercel Dashboard (Frontend project)

**Hướng dẫn chụp ảnh:**
- Sử dụng browser developer tools (F12) để chụp full page
- Hoặc sử dụng extension như "Full Page Screen Capture"
- Lưu ảnh với tên rõ ràng: `homepage.png`, `courses-list.png`, etc.
- Chèn ảnh vào báo cáo với caption mô tả

#### 5.5.2. Demo thực tế

**Các bước demo:**

1. **Demo đăng ký/đăng nhập:**
   - Mở trang chủ
   - Click "Đăng ký"
   - Điền form và đăng ký
   - Đăng nhập với tài khoản vừa tạo

2. **Demo xem và đăng ký khóa học:**
   - Xem danh sách khóa học
   - Click vào một khóa học
   - Xem chi tiết
   - Click "Đăng ký khóa học"

3. **Demo học tập:**
   - Vào khóa học đã đăng ký
   - Xem video bài học
   - Làm bài tập và nộp bài
   - Tham gia thảo luận

4. **Demo quản lý (Teacher):**
   - Đăng nhập với tài khoản teacher
   - Tạo khóa học mới
   - Tạo bài học
   - Chấm bài tập

5. **Demo quản lý (Admin):**
   - Đăng nhập với tài khoản admin
   - Duyệt khóa học
   - Duyệt yêu cầu nạp tiền
   - Xem thống kê

**Video demo (nếu có):**
- Quay video demo các chức năng chính
- Upload lên YouTube hoặc Google Drive
- Link video trong báo cáo

---

## KẾT LUẬN

Hệ thống học trực tuyến đã được xây dựng thành công với đầy đủ các chức năng:
- ✅ Backend API hoàn chỉnh với FastAPI
- ✅ Frontend responsive với React
- ✅ Database PostgreSQL với đầy đủ migrations
- ✅ Authentication và Authorization
- ✅ Thanh toán và ví điện tử
- ✅ Deploy trên Render và Vercel
- ✅ Code tuân thủ coding conventions
- ✅ Documentation đầy đủ

Hệ thống đã sẵn sàng để sử dụng trong môi trường production.

---

## TÀI LIỆU THAM KHẢO

1. FastAPI Documentation: https://fastapi.tiangolo.com/
2. React Documentation: https://react.dev/
3. PostgreSQL Documentation: https://www.postgresql.org/docs/
4. Render Documentation: https://render.com/docs
5. Vercel Documentation: https://vercel.com/docs

---

**Người thực hiện:** [Tên sinh viên]

**Ngày hoàn thành:** [Ngày tháng năm]
