"""
Ứng dụng học trực tuyến - Flask Backend
Môn: Phát triển ứng dụng mã nguồn mở
"""
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os
from datetime import datetime
from flask import g
import random
import string

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Cấu hình MySQL
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'webhoctructuyen')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)


def ensure_discussion_table(cur):
    """Đảm bảo bảng thảo luận tồn tại trước khi dùng."""
    cur.execute(
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


def ensure_extended_tables(cur):
    """Đảm bảo các bảng cho thanh toán, điểm danh, chứng nhận tồn tại."""
    cur.execute(
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

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS diem_danh (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lich_hoc_id INT NOT NULL,
            user_id INT NOT NULL,
            status ENUM('present','absent','late') DEFAULT 'present',
            noted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_attend (lich_hoc_id, user_id),
            FOREIGN KEY (lich_hoc_id) REFERENCES lich_hoc(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    cur.execute(
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


def generate_code(prefix="CERT"):
    return f"{prefix}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"


def compute_progress(cur, course_id, user_id):
    """Tính tiến độ học viên cho khóa học."""
    cur.execute("SELECT COUNT(*) AS total FROM lich_hoc WHERE khoa_hoc_id=%s", (course_id,))
    total_sessions = cur.fetchone()["total"]
    cur.execute(
        """
        SELECT COUNT(*) AS present_count
        FROM diem_danh dd
        JOIN lich_hoc lh ON dd.lich_hoc_id = lh.id
        WHERE lh.khoa_hoc_id=%s AND dd.user_id=%s AND dd.status IN ('present','late')
        """,
        (course_id, user_id),
    )
    present_count = cur.fetchone()["present_count"]

    attendance_ratio = present_count / total_sessions if total_sessions else 1

    cur.execute("SELECT COUNT(*) AS total_req FROM bai_tap WHERE khoa_hoc_id=%s AND is_required=1", (course_id,))
    total_req = cur.fetchone()["total_req"]
    cur.execute(
        """
        SELECT COUNT(*) AS submitted_req
        FROM bai_tap bt
        JOIN nop_bai nb ON nb.bai_tap_id = bt.id
        WHERE bt.khoa_hoc_id=%s AND bt.is_required=1 AND nb.user_id=%s
        """,
        (course_id, user_id),
    )
    submitted_req = cur.fetchone()["submitted_req"]
    assignment_ratio = submitted_req / total_req if total_req else 1

    progress_ratio = (attendance_ratio + assignment_ratio) / 2 if (total_sessions or total_req) else 1
    completed = attendance_ratio >= 0.7 and (total_req == 0 or submitted_req == total_req)

    return {
        "attendance_ratio": attendance_ratio,
        "assignment_ratio": assignment_ratio,
        "progress_ratio": progress_ratio,
        "completed": completed,
        "total_sessions": total_sessions,
        "present_count": present_count,
        "total_required_assign": total_req,
        "submitted_required_assign": submitted_req,
    }

# ==================== DECORATORS ====================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập để tiếp tục', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập', 'warning')
            return redirect(url_for('login'))
        if session.get('role') != 'admin':
            flash('Bạn không có quyền truy cập', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def teacher_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập', 'warning')
            return redirect(url_for('login'))
        if session.get('role') != 'teacher':
            flash('Bạn không có quyền truy cập', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# ==================== ROUTES ====================

@app.route('/')
def index():
    """Trang chủ"""
    cur = mysql.connection.cursor()
    # Lấy 6 khóa học mới nhất
    cur.execute("""
        SELECT * FROM khoa_hoc 
        WHERE trang_thai = 'active' 
        ORDER BY id DESC 
        LIMIT 6
    """)
    courses = cur.fetchall()
    cur.close()
    return render_template('index.html', courses=courses)

@app.route('/courses')
def courses():
    """Trang danh sách khóa học"""
    search = request.args.get('search', '').strip()
    level = request.args.get('level', '')
    mode = request.args.get('mode', '')
    sort = request.args.get('sort', 'new')
 
    cur = mysql.connection.cursor()
    query = """
        SELECT 
            kh.*, 
            COALESCE(AVG(dg.diem_so), 0) AS avg_score,
            COUNT(DISTINCT dg.id) AS review_count,
            COUNT(DISTINCT dkkh.id) AS student_count
        FROM khoa_hoc kh
        LEFT JOIN danh_gia_khoa_hoc dg ON dg.khoa_hoc_id = kh.id
        LEFT JOIN dang_ky_khoa_hoc dkkh ON dkkh.khoa_hoc_id = kh.id
        WHERE kh.trang_thai = 'active'
    """
    params = []
    
    if search:
        query += " AND (kh.tieu_de LIKE %s OR kh.mo_ta LIKE %s)"
        params.extend([f'%{search}%', f'%{search}%'])
    
    if level:
        query += " AND kh.cap_do = %s"
        params.append(level)
 
    if mode:
        query += " AND kh.hinh_thuc = %s"
        params.append(mode)
    
    query += " GROUP BY kh.id"
 
    order_clause = "kh.id DESC"
    if sort == 'price_asc':
        order_clause = "kh.gia ASC"
    elif sort == 'price_desc':
        order_clause = "kh.gia DESC"
    elif sort == 'popular':
        order_clause = "student_count DESC, kh.id DESC"
    elif sort == 'rating':
        order_clause = "avg_score DESC, review_count DESC"
 
    query += f" ORDER BY {order_clause}"
    cur.execute(query, params)
    courses = cur.fetchall()
    cur.close()
    
    return render_template(
        'courses.html', 
        courses=courses, 
        search=search, 
        level=level,
        mode=mode,
        sort=sort,
    )

@app.route('/course/<int:course_id>')
def course_detail(course_id):
    """Chi tiết khóa học"""
    cur = mysql.connection.cursor()
    ensure_discussion_table(cur)
    
    # Lấy thông tin khóa học
    cur.execute("SELECT * FROM khoa_hoc WHERE id = %s", (course_id,))
    course = cur.fetchone()
    
    if not course:
        flash('Khóa học không tồn tại', 'danger')
        return redirect(url_for('courses'))
    
    # Lấy chi tiết khóa học
    cur.execute("""
        SELECT * FROM chi_tiet_khoa_hoc 
        WHERE khoa_hoc_id = %s 
        ORDER BY thu_tu ASC
    """, (course_id,))
    details = cur.fetchall()
    
    # Lấy đánh giá
    cur.execute("""
        SELECT dg.*, u.ho_ten, u.id as user_id
        FROM danh_gia_khoa_hoc dg
        JOIN users u ON dg.user_id = u.id
        WHERE dg.khoa_hoc_id = %s
        ORDER BY dg.created_at DESC
        LIMIT 10
    """, (course_id,))
    reviews = cur.fetchall()

    # Lấy thảo luận
    cur.execute(
        """
        SELECT tl.*, u.ho_ten
        FROM thao_luan tl
        JOIN users u ON tl.user_id = u.id
        WHERE tl.khoa_hoc_id = %s
        ORDER BY tl.created_at DESC
        LIMIT 30
        """,
        (course_id,),
    )
    discussions = cur.fetchall()

    cur.close()
    return render_template('course_detail.html', course=course, details=details, reviews=reviews, discussions=discussions)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Đăng ký tài khoản"""
    if request.method == 'POST':
        ho_ten = request.form['ho_ten']
        email = request.form['email']
        password = request.form['password']
        so_dien_thoai = request.form.get('so_dien_thoai', '')
        role = request.form.get('role', 'student')
        
        cur = mysql.connection.cursor()
        
        # Kiểm tra email đã tồn tại
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            flash('Email đã được sử dụng', 'danger')
            cur.close()
            return render_template('register.html')
        
        # Tạo tài khoản mới
        password_hash = generate_password_hash(password)
        cur.execute("""
            INSERT INTO users (ho_ten, email, password_hash, so_dien_thoai, role)
            VALUES (%s, %s, %s, %s, %s)
        """, (ho_ten, email, password_hash, so_dien_thoai, role))
        mysql.connection.commit()
        cur.close()
        
        flash('Đăng ký thành công! Vui lòng đăng nhập', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Đăng nhập"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['ho_ten'] = user['ho_ten']
            session['email'] = user['email']
            session['role'] = user['role']
            flash(f'Chào mừng, {user["ho_ten"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Email hoặc mật khẩu không đúng', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Đăng xuất"""
    session.clear()
    flash('Đã đăng xuất thành công', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard người dùng"""
    user_id = session['user_id']
    role = session.get('role')
    
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    
    if role == 'student':
        # Lấy khóa học đã đăng ký
        cur.execute("""
            SELECT kh.*, dkkh.trang_thai as enrollment_status, dkkh.created_at as enrolled_at
            FROM dang_ky_khoa_hoc dkkh
            JOIN khoa_hoc kh ON dkkh.khoa_hoc_id = kh.id
            WHERE dkkh.user_id = %s
            ORDER BY dkkh.created_at DESC
        """, (user_id,))
        enrolled_courses = cur.fetchall()

        # Tính tiến độ và chứng nhận
        for course in enrolled_courses:
            progress = compute_progress(cur, course['id'], user_id)
            course['progress'] = progress

            # Tự động cấp chứng nhận nếu hoàn thành
            if progress['completed']:
                cur.execute(
                    "SELECT id, code FROM certificates WHERE user_id=%s AND khoa_hoc_id=%s",
                    (user_id, course['id']),
                )
                cert = cur.fetchone()
                if not cert:
                    code = generate_code()
                    cur.execute(
                        """
                        INSERT INTO certificates (user_id, khoa_hoc_id, code)
                        VALUES (%s,%s,%s)
                        """,
                        (user_id, course['id'], code),
                    )
                    mysql.connection.commit()
                    course['certificate_code'] = code
                else:
                    course['certificate_code'] = cert['code']
            else:
                course['certificate_code'] = None
        
        cur.close()
        return render_template('student/dashboard.html', enrolled_courses=enrolled_courses)
    
    elif role == 'teacher':
        # Lấy lớp học của giáo viên
        cur.execute("""
            SELECT kh.*, COUNT(dkkh.id) as so_hoc_vien
            FROM khoa_hoc kh
            LEFT JOIN dang_ky_khoa_hoc dkkh ON kh.id = dkkh.khoa_hoc_id
            WHERE kh.teacher_id = %s
            GROUP BY kh.id
            ORDER BY kh.id DESC
        """, (user_id,))
        my_courses = cur.fetchall()
        
        cur.close()
        return render_template('teacher/dashboard.html', my_courses=my_courses)
    
    elif role == 'admin':
        # Thống kê admin
        cur.execute("SELECT COUNT(*) as total FROM users WHERE role = 'student'")
        total_students = cur.fetchone()['total']
        
        cur.execute("SELECT COUNT(*) as total FROM khoa_hoc")
        total_courses = cur.fetchone()['total']
        
        cur.execute("SELECT COUNT(*) as total FROM dang_ky_khoa_hoc WHERE trang_thai = 'active'")
        total_enrollments = cur.fetchone()['total']
        
        cur.close()
        return render_template('admin/dashboard.html', 
                             total_students=total_students,
                             total_courses=total_courses,
                             total_enrollments=total_enrollments)
    
    cur.close()
    return redirect(url_for('index'))

# ==================== API ROUTES ====================

@app.route('/api/enroll/<int:course_id>', methods=['POST'])
@login_required
def enroll_course(course_id):
    """Đăng ký khóa học"""
    user_id = session['user_id']
    
    cur = mysql.connection.cursor()
    
    # Kiểm tra đã đăng ký chưa
    cur.execute("""
        SELECT id FROM dang_ky_khoa_hoc 
        WHERE user_id = %s AND khoa_hoc_id = %s
    """, (user_id, course_id))
    
    if cur.fetchone():
        cur.close()
        return jsonify({'success': False, 'message': 'Bạn đã đăng ký khóa học này'}), 400
    
    # Đăng ký
    cur.execute("""
        INSERT INTO dang_ky_khoa_hoc (user_id, khoa_hoc_id, trang_thai)
        VALUES (%s, %s, 'active')
    """, (user_id, course_id))
    mysql.connection.commit()
    cur.close()
    
    return jsonify({'success': True, 'message': 'Đăng ký thành công!'})

# ==================== THANH TOÁN / MUA KHÓA HỌC ====================

@app.route('/course/<int:course_id>/buy', methods=['POST'])
@login_required
def buy_course(course_id):
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)

    # Kiểm tra khóa học
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND trang_thai='active'", (course_id,))
    course = cur.fetchone()
    if not course:
        cur.close()
        return jsonify({'success': False, 'message': 'Khóa học không tồn tại'}), 404

    amount = course.get('gia', 0) or 0

    # Tạo bản ghi thanh toán giả lập (đã thanh toán)
    cur.execute(
        """
        INSERT INTO payments (user_id, khoa_hoc_id, amount, provider, status, txn_ref)
        VALUES (%s,%s,%s,%s,%s,%s)
        """,
        (session['user_id'], course_id, amount, 'sandbox', 'paid', f'TXN-{course_id}-{session["user_id"]}-{int(datetime.now().timestamp())}'),
    )

    # Ghi enrollment (upsert)
    cur.execute(
        "SELECT id FROM dang_ky_khoa_hoc WHERE user_id=%s AND khoa_hoc_id=%s",
        (session['user_id'], course_id),
    )
    existing = cur.fetchone()
    if existing:
        cur.execute(
            "UPDATE dang_ky_khoa_hoc SET trang_thai='active', updated_at=CURRENT_TIMESTAMP WHERE id=%s",
            (existing['id'],),
        )
    else:
        cur.execute(
            """
            INSERT INTO dang_ky_khoa_hoc (user_id, khoa_hoc_id, trang_thai)
            VALUES (%s,%s,'active')
            """,
            (session['user_id'], course_id),
        )

    mysql.connection.commit()
    cur.close()
    return jsonify({'success': True, 'message': 'Thanh toán thành công, bạn đã được ghi danh!'})

# ==================== CHỨC NĂNG NÂNG CAO 1: HỆ THỐNG ĐÁNH GIÁ ====================

@app.route('/course/<int:course_id>/review', methods=['POST'])
@login_required
def add_review(course_id):
    """Thêm đánh giá cho khóa học"""
    user_id = session['user_id']
    diem_so = int(request.form.get('diem_so', 5))
    noi_dung = request.form.get('noi_dung', '')
    
    if diem_so < 1 or diem_so > 5:
        flash('Điểm số phải từ 1 đến 5', 'danger')
        return redirect(url_for('course_detail', course_id=course_id))
    
    cur = mysql.connection.cursor()
    
    # Kiểm tra đã đánh giá chưa
    cur.execute("""
        SELECT id FROM danh_gia_khoa_hoc 
        WHERE user_id = %s AND khoa_hoc_id = %s
    """, (user_id, course_id))
    
    if cur.fetchone():
        flash('Bạn đã đánh giá khóa học này rồi', 'warning')
        cur.close()
        return redirect(url_for('course_detail', course_id=course_id))
    
    # Thêm đánh giá
    cur.execute("""
        INSERT INTO danh_gia_khoa_hoc (user_id, khoa_hoc_id, diem_so, noi_dung)
        VALUES (%s, %s, %s, %s)
    """, (user_id, course_id, diem_so, noi_dung))
    
    # Cập nhật điểm trung bình
    cur.execute("""
        SELECT AVG(diem_so) as avg_score, COUNT(*) as count
        FROM danh_gia_khoa_hoc
        WHERE khoa_hoc_id = %s
    """, (course_id,))
    stats = cur.fetchone()
    
    cur.execute("""
        UPDATE khoa_hoc 
        SET danh_gia_trung_binh = %s, so_luong_danh_gia = %s
        WHERE id = %s
    """, (float(stats['avg_score']), stats['count'], course_id))
    
    mysql.connection.commit()
    cur.close()
    
    flash('Cảm ơn bạn đã đánh giá!', 'success')
    return redirect(url_for('course_detail', course_id=course_id))

# ==================== THẢO LUẬN KHÓA HỌC ====================

@app.route('/course/<int:course_id>/discussion', methods=['POST'])
@login_required
def add_discussion(course_id):
    """Thêm bình luận/thảo luận cho khóa học"""
    content = request.form.get('noi_dung', '').strip()
    if not content:
        flash('Nội dung không được để trống', 'warning')
        return redirect(url_for('course_detail', course_id=course_id))

    cur = mysql.connection.cursor()
    ensure_discussion_table(cur)

    cur.execute("SELECT id FROM khoa_hoc WHERE id = %s", (course_id,))
    if not cur.fetchone():
        cur.close()
        flash('Khóa học không tồn tại', 'danger')
        return redirect(url_for('courses'))

    cur.execute(
        """
        INSERT INTO thao_luan (khoa_hoc_id, user_id, noi_dung)
        VALUES (%s, %s, %s)
        """,
        (course_id, session['user_id'], content),
    )
    mysql.connection.commit()
    cur.close()

    flash('Đã gửi thảo luận của bạn', 'success')
    return redirect(url_for('course_detail', course_id=course_id))

# ==================== CHỨC NĂNG NÂNG CAO 2: QUẢN LÝ BÀI TẬP ====================

@app.route('/course/<int:course_id>/assignments/create', methods=['GET', 'POST'])
@teacher_required
def create_assignment(course_id):
    """Tạo bài tập mới (Giáo viên)"""
    if request.method == 'POST':
        tieu_de = request.form.get('tieu_de')
        mo_ta = request.form.get('mo_ta', '')
        noi_dung = request.form.get('noi_dung')
        han_nop = request.form.get('han_nop') or None
        
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO bai_tap (khoa_hoc_id, tieu_de, mo_ta, noi_dung, han_nop)
            VALUES (%s, %s, %s, %s, %s)
        """, (course_id, tieu_de, mo_ta, noi_dung, han_nop))
        mysql.connection.commit()
        cur.close()
        
        flash('Tạo bài tập thành công!', 'success')
        return redirect(url_for('assignments', course_id=course_id))
    
    return render_template('teacher/create_assignment.html', course_id=course_id)

# ==================== ĐIỂM DANH ====================

@app.route('/teacher/attendance/<int:course_id>', methods=['GET', 'POST'])
@teacher_required
def teacher_attendance(course_id):
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)

    # Kiểm tra giáo viên sở hữu khóa
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))

    # Danh sách buổi học
    cur.execute("SELECT * FROM lich_hoc WHERE khoa_hoc_id=%s ORDER BY ngay_hoc, gio_bat_dau", (course_id,))
    sessions = cur.fetchall()

    session_id = request.args.get('session_id') or (sessions[0]['id'] if sessions else None)

    # Học viên trong khóa
    cur.execute(
        """
        SELECT u.id, u.ho_ten, u.email
        FROM dang_ky_khoa_hoc d
        JOIN users u ON d.user_id = u.id
        WHERE d.khoa_hoc_id=%s AND d.trang_thai='active'
        """,
        (course_id,),
    )
    students = cur.fetchall()

    if request.method == 'POST' and session_id:
        # Lưu điểm danh
        for s in students:
            status = request.form.get(f'status_{s["id"]}', 'present')
            cur.execute(
                """
                INSERT INTO diem_danh (lich_hoc_id, user_id, status)
                VALUES (%s,%s,%s)
                ON DUPLICATE KEY UPDATE status=VALUES(status), noted_at=CURRENT_TIMESTAMP
                """,
                (session_id, s['id'], status),
            )
        mysql.connection.commit()
        flash('Đã lưu điểm danh', 'success')
        return redirect(url_for('teacher_attendance', course_id=course_id, session_id=session_id))

    # Lấy trạng thái điểm danh cho buổi chọn
    attendance_map = {}
    if session_id:
        cur.execute(
            "SELECT user_id, status FROM diem_danh WHERE lich_hoc_id=%s",
            (session_id,),
        )
        for row in cur.fetchall():
            attendance_map[row['user_id']] = row['status']

    cur.close()
    return render_template(
        'teacher/attendance.html',
        course=course,
        sessions=sessions,
        students=students,
        session_id=int(session_id) if session_id else None,
        attendance_map=attendance_map,
    )

# ==================== CHỨNG NHẬN ====================

@app.route('/certificate/<int:course_id>')
@login_required
def view_certificate(course_id):
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    cur.execute(
        "SELECT * FROM certificates WHERE user_id=%s AND khoa_hoc_id=%s",
        (session['user_id'], course_id),
    )
    cert = cur.fetchone()
    cur.execute("SELECT tieu_de FROM khoa_hoc WHERE id=%s", (course_id,))
    course = cur.fetchone()
    cur.close()
    if not cert:
        flash('Chưa có chứng nhận cho khóa này', 'warning')
        return redirect(url_for('dashboard'))
    return render_template('certificate.html', cert=cert, course=course)

@app.route('/course/<int:course_id>/assignments')
@login_required
def assignments(course_id):
    """Danh sách bài tập của khóa học"""
    user_id = session['user_id']
    role = session.get('role')
    
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền truy cập
    if role == 'student':
        cur.execute("""
            SELECT id FROM dang_ky_khoa_hoc 
            WHERE user_id = %s AND khoa_hoc_id = %s AND trang_thai = 'active'
        """, (user_id, course_id))
        if not cur.fetchone():
            flash('Bạn chưa đăng ký khóa học này', 'warning')
            cur.close()
            return redirect(url_for('courses'))
    
    # Lấy bài tập
    cur.execute("""
        SELECT * FROM bai_tap 
        WHERE khoa_hoc_id = %s 
        ORDER BY created_at DESC
    """, (course_id,))
    assignments_list = cur.fetchall()
    
    # Nếu là học viên, lấy trạng thái nộp bài
    submissions = {}
    if role == 'student':
        for assignment in assignments_list:
            cur.execute("""
                SELECT * FROM nop_bai 
                WHERE bai_tap_id = %s AND user_id = %s
                ORDER BY created_at DESC
                LIMIT 1
            """, (assignment['id'], user_id))
            submission = cur.fetchone()
            if submission:
                submissions[assignment['id']] = submission
    
    cur.close()
    return render_template('assignments.html', 
                         assignments=assignments_list, 
                         course_id=course_id,
                         submissions=submissions,
                         role=role)

@app.route('/assignment/<int:assignment_id>/submit', methods=['GET', 'POST'])
@login_required
def submit_assignment(assignment_id):
    """Nộp bài tập"""
    user_id = session['user_id']
    
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM bai_tap WHERE id = %s", (assignment_id,))
    assignment = cur.fetchone()
    
    if not assignment:
        flash('Bài tập không tồn tại', 'danger')
        cur.close()
        return redirect(url_for('courses'))
    
    if request.method == 'POST':
        noi_dung = request.form.get('noi_dung', '')
        file_path = None
        
        # Xử lý upload file (nếu có)
        if 'file' in request.files:
            file = request.files['file']
            if file.filename:
                import os
                upload_folder = os.path.join('static', 'uploads', 'assignments')
                os.makedirs(upload_folder, exist_ok=True)
                filename = f"{user_id}_{assignment_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
                file_path = os.path.join(upload_folder, filename)
                file.save(file_path)
                file_path = '/' + file_path.replace('\\', '/')
        
        # Lưu bài nộp
        cur.execute("""
            INSERT INTO nop_bai (bai_tap_id, user_id, noi_dung, file_path, trang_thai)
            VALUES (%s, %s, %s, %s, 'submitted')
        """, (assignment_id, user_id, noi_dung, file_path))
        mysql.connection.commit()
        cur.close()
        
        flash('Nộp bài thành công!', 'success')
        return redirect(url_for('assignments', course_id=assignment['khoa_hoc_id']))
    
    cur.close()
    return render_template('submit_assignment.html', assignment=assignment)

@app.route('/assignment/<int:assignment_id>/grade', methods=['POST'])
@teacher_required
def grade_assignment(assignment_id):
    """Giáo viên chấm điểm bài tập"""
    submission_id = request.form.get('submission_id')
    diem_so = float(request.form.get('diem_so', 0))
    nhan_xet = request.form.get('nhan_xet', '')
    
    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE nop_bai 
        SET diem_so = %s, nhan_xet = %s, trang_thai = 'graded'
        WHERE id = %s
    """, (diem_so, nhan_xet, submission_id))
    mysql.connection.commit()
    cur.close()
    
    flash('Chấm điểm thành công!', 'success')
    return redirect(request.referrer or url_for('dashboard'))

# ==================== CHỨC NĂNG NÂNG CAO 3: HỆ THỐNG THÔNG BÁO ====================

@app.route('/notifications')
@login_required
def notifications():
    """Danh sách thông báo"""
    user_id = session['user_id']
    role = session.get('role')
    
    cur = mysql.connection.cursor()
    
    # Lấy thông báo
    if role == 'student':
        # Thông báo hệ thống + thông báo khóa học đã đăng ký
        cur.execute("""
            SELECT DISTINCT tb.* 
            FROM thong_bao tb
            LEFT JOIN dang_ky_khoa_hoc dkkh ON tb.khoa_hoc_id = dkkh.khoa_hoc_id
            WHERE (tb.loai = 'system' OR (tb.loai = 'course' AND dkkh.user_id = %s))
            AND tb.is_active = 1
            ORDER BY tb.created_at DESC
        """, (user_id,))
    else:
        # Admin và teacher xem tất cả
        cur.execute("""
            SELECT * FROM thong_bao 
            WHERE is_active = 1
            ORDER BY created_at DESC
        """)
    
    notifications_list = cur.fetchall()
    cur.close()
    
    return render_template('notifications.html', notifications=notifications_list)

@app.route('/admin/notifications/create', methods=['GET', 'POST'])
@admin_required
def create_notification():
    """Tạo thông báo mới (Admin)"""
    if request.method == 'POST':
        tieu_de = request.form.get('tieu_de')
        noi_dung = request.form.get('noi_dung')
        loai = request.form.get('loai', 'system')
        khoa_hoc_id = request.form.get('khoa_hoc_id') or None
        
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO thong_bao (tieu_de, noi_dung, loai, khoa_hoc_id)
            VALUES (%s, %s, %s, %s)
        """, (tieu_de, noi_dung, loai, khoa_hoc_id))
        mysql.connection.commit()
        cur.close()
        
        flash('Tạo thông báo thành công!', 'success')
        return redirect(url_for('notifications'))
    
    # Lấy danh sách khóa học cho dropdown
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, tieu_de FROM khoa_hoc WHERE trang_thai = 'active'")
    courses = cur.fetchall()
    cur.close()
    
    return render_template('admin/create_notification.html', courses=courses)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

