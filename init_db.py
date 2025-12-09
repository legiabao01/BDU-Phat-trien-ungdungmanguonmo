"""
Script khởi tạo database và tạo tài khoản mặc định
Chạy: python init_db.py
"""
from werkzeug.security import generate_password_hash
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def init_database():
    """Khởi tạo database và tạo tài khoản mặc định"""
    try:
        # Kết nối MySQL (không chỉ định database)
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', '')
        )
        
        cursor = conn.cursor()
        
        # Đọc và chạy schema.sql
        print("Đang tạo database...")
        with open('database/schema.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
            # Tách các câu lệnh
            for statement in sql_script.split(';'):
                if statement.strip():
                    try:
                        cursor.execute(statement)
                    except Error as e:
                        if "already exists" not in str(e).lower():
                            print(f"Warning: {e}")
        
        conn.commit()
        
        # Kết nối vào database đã tạo
        conn.close()
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DB', 'webhoctructuyen')
        )
        cursor = conn.cursor(dictionary=True)

        # Đảm bảo bảng thảo luận tồn tại
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS thao_luan (
                id INT AUTO_INCREMENT PRIMARY KEY,
                khoa_hoc_id INT NOT NULL,
                user_id INT NOT NULL,
                noi_dung TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        )

        # Đảm bảo cột is_required cho bai_tap
        try:
            cursor.execute("ALTER TABLE bai_tap ADD COLUMN is_required TINYINT(1) DEFAULT 0;")
        except Error as e:
            if "Duplicate column" not in str(e):
                print(f"Warning: {e}")

        # Đảm bảo bảng payments
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                khoa_hoc_id INT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                provider VARCHAR(50) DEFAULT 'sandbox',
                status ENUM('pending','paid','failed') DEFAULT 'paid',
                txn_ref VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        )

        # Đảm bảo bảng điểm danh
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS diem_danh (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lich_hoc_id INT NOT NULL,
                user_id INT NOT NULL,
                status ENUM('present','absent','late') DEFAULT 'present',
                noted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lich_hoc_id) REFERENCES lich_hoc(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        )

        # Đảm bảo bảng certificates
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS certificates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                khoa_hoc_id INT NOT NULL,
                code VARCHAR(50) UNIQUE,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        )
        
        # ---------- Users ----------
        def ensure_user(name, email, password, role):
            cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
            row = cursor.fetchone()
            if row:
                return row["id"]
            password_hash = generate_password_hash(password)
            cursor.execute(
                """
                INSERT INTO users (ho_ten, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
                """,
                (name, email, password_hash, role),
            )
            conn.commit()
            return cursor.lastrowid

        admin_id = ensure_user("Admin", "admin@example.com", "admin123", "admin")
        teacher_id = ensure_user("Nguyễn Văn A", "teacher@example.com", "teacher123", "teacher")
        student_id = ensure_user("Trần Minh B", "student@example.com", "student123", "student")

        # ---------- Courses ----------
        cursor.execute("SELECT COUNT(*) AS total FROM khoa_hoc")
        if cursor.fetchone()["total"] == 0:
            courses = [
                (
                    "Lập trình Python cơ bản",
                    "Học từ cú pháp tới OOP với nhiều bài tập thực hành.",
                    "Beginner",
                    "online",
                    500000,
                    20,
                    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
                    teacher_id,
                ),
                (
                    "Lập trình Web với Flask",
                    "Xây dựng web app full-stack với Flask, Jinja, MySQL.",
                    "Intermediate",
                    "online",
                    800000,
                    18,
                    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
                    teacher_id,
                ),
                (
                    "Machine Learning cơ bản",
                    "Thuật toán nền tảng và quy trình huấn luyện mô hình.",
                    "Advanced",
                    "hybrid",
                    1200000,
                    24,
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                    teacher_id,
                ),
            ]
            cursor.executemany(
                """
                INSERT INTO khoa_hoc
                (tieu_de, mo_ta, cap_do, hinh_thuc, gia, so_buoi, hinh_anh, teacher_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                courses,
            )
            conn.commit()

        # Lấy id khóa học sau khi thêm
        cursor.execute("SELECT id, tieu_de FROM khoa_hoc ORDER BY id")
        course_rows = cursor.fetchall()
        course_map = {c["tieu_de"]: c["id"] for c in course_rows}

        # ---------- Course content ----------
        if course_rows:
            cursor.execute("SELECT COUNT(*) AS total FROM chi_tiet_khoa_hoc")
            if cursor.fetchone()["total"] == 0:
                details = []
                if "Lập trình Python cơ bản" in course_map:
                    cid = course_map["Lập trình Python cơ bản"]
                    details.extend(
                        [
                            (cid, "Giới thiệu & cài đặt môi trường", "Hướng dẫn VS Code, Python, pip.", 1),
                            (cid, "Biến, kiểu dữ liệu, control flow", "If/else, loop, list, dict.", 2),
                            (cid, "Hàm & module", "Viết hàm, import, venv.", 3),
                            (cid, "OOP căn bản", "Class, object, kế thừa.", 4),
                        ]
                    )
                if "Lập trình Web với Flask" in course_map:
                    cid = course_map["Lập trình Web với Flask"]
                    details.extend(
                        [
                            (cid, "Flask cơ bản", "Route, template, form.", 1),
                            (cid, "ORM & MySQL", "Kết nối DB, CRUD.", 2),
                            (cid, "Auth & Session", "Login, role-based access.", 3),
                            (cid, "Triển khai", "Env, config, deploy.", 4),
                        ]
                    )
                if "Machine Learning cơ bản" in course_map:
                    cid = course_map["Machine Learning cơ bản"]
                    details.extend(
                        [
                            (cid, "Quy trình ML", "Thu thập, xử lý, train/test.", 1),
                            (cid, "Hồi quy & phân loại", "Linear/Logistic regression.", 2),
                            (cid, "Cây quyết định & SVM", "Mô hình cổ điển.", 3),
                            (cid, "Đánh giá & cải thiện", "Metrics, cross-validate.", 4),
                        ]
                    )
                cursor.executemany(
                    """
                    INSERT INTO chi_tiet_khoa_hoc (khoa_hoc_id, tieu_de_muc, noi_dung, thu_tu)
                    VALUES (%s,%s,%s,%s)
                    """,
                    details,
                )
                conn.commit()

        # ---------- Sample enrollments ----------
        cursor.execute("SELECT COUNT(*) AS total FROM dang_ky_khoa_hoc")
        if cursor.fetchone()["total"] == 0 and course_rows:
            # Student đăng ký 2 khóa đầu
            enrolls = []
            for title in ["Lập trình Python cơ bản", "Lập trình Web với Flask"]:
                if title in course_map:
                    enrolls.append((student_id, course_map[title], "active"))
            if enrolls:
                cursor.executemany(
                    """
                    INSERT INTO dang_ky_khoa_hoc (user_id, khoa_hoc_id, trang_thai)
                    VALUES (%s,%s,%s)
                    """,
                    enrolls,
                )
                conn.commit()

        # ---------- Assignments ----------
        cursor.execute("SELECT COUNT(*) AS total FROM bai_tap")
        if cursor.fetchone()["total"] == 0:
            assigns = []
            if "Lập trình Python cơ bản" in course_map:
                cid = course_map["Lập trình Python cơ bản"]
                assigns.extend(
                    [
                        (cid, "Bài tập 1: Cú pháp Python", "Làm quen biến, vòng lặp.", "Viết 5 bài nhỏ", None, 1),
                        (cid, "Bài tập 2: OOP", "Thiết kế class đơn giản.", "Xây dựng class Student/Course", None, 1),
                    ]
                )
            if "Lập trình Web với Flask" in course_map:
                cid = course_map["Lập trình Web với Flask"]
                assigns.append(
                    (cid, "Bài tập Flask CRUD", "Tạo CRUD cho bài viết", "Dùng form + MySQL", None, 1)
                )
            cursor.executemany(
                """
                INSERT INTO bai_tap (khoa_hoc_id, tieu_de, mo_ta, noi_dung, han_nop, is_required)
                VALUES (%s,%s,%s,%s,%s,%s)
                """,
                assigns,
            )
            conn.commit()

        # ---------- Notifications ----------
        cursor.execute("SELECT COUNT(*) AS total FROM thong_bao")
        if cursor.fetchone()["total"] == 0:
            noti = []
            if "Lập trình Python cơ bản" in course_map:
                noti.append(
                    ("Chào mừng lớp Python", "Bạn đã đăng ký thành công khóa Python cơ bản.", "course", course_map["Lập trình Python cơ bản"])
                )
            noti.append(
                ("Cập nhật hệ thống", "Trang web vừa được bổ sung dữ liệu mẫu và bài tập.", "system", None)
            )
            cursor.executemany(
                """
                INSERT INTO thong_bao (tieu_de, noi_dung, loai, khoa_hoc_id)
                VALUES (%s,%s,%s,%s)
                """,
                noti,
            )
            conn.commit()

        # ---------- Discussions ----------
        cursor.execute("SELECT COUNT(*) AS total FROM thao_luan")
        if cursor.fetchone()["total"] == 0 and course_rows:
            discussions = []
            if "Lập trình Web với Flask" in course_map:
                discussions.append(
                    (
                        course_map["Lập trình Web với Flask"],
                        student_id,
                        "Khóa này có bài tập deploy lên đâu vậy ạ?",
                    )
                )
                discussions.append(
                    (
                        course_map["Lập trình Web với Flask"],
                        teacher_id,
                        "Bạn có thể deploy lên Render/Heroku hoặc server riêng. Có hướng dẫn trong tuần 4.",
                    )
                )
            if discussions:
                cursor.executemany(
                    """
                    INSERT INTO thao_luan (khoa_hoc_id, user_id, noi_dung)
                    VALUES (%s,%s,%s)
                    """,
                    discussions,
                )
                conn.commit()

        # ---------- Lịch học mẫu ----------
        cursor.execute("SELECT COUNT(*) AS total FROM lich_hoc")
        if cursor.fetchone()["total"] == 0 and course_rows:
            schedules = []
            for title, date_str in [
                ("Lập trình Python cơ bản", "2025-01-10"),
                ("Lập trình Python cơ bản", "2025-01-17"),
                ("Lập trình Web với Flask", "2025-01-12"),
                ("Lập trình Web với Flask", "2025-01-19"),
            ]:
                if title in course_map:
                    schedules.append(
                        (
                            course_map[title],
                            date_str,
                            "19:00:00",
                            "21:00:00",
                            "Phòng Zoom",
                            "https://zoom.example.com/demo",
                            "Buổi học trực tuyến",
                        )
                    )
            if schedules:
                cursor.executemany(
                    """
                    INSERT INTO lich_hoc (khoa_hoc_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, phong, link_zoom, ghi_chu)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                    """,
                    schedules,
                )
                conn.commit()

        print("✅ Database đã được khởi tạo và nạp dữ liệu mẫu!")
        print("\nTài khoản mặc định:")
        print("Admin: admin@example.com / admin123")
        print("Teacher: teacher@example.com / teacher123")
        print("Student: student@example.com / student123")
        
    except Error as e:
        print(f"❌ Lỗi: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    init_database()


