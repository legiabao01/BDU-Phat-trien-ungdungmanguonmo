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
    # Tạo bảng payments với status bao gồm refunded
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            khoa_hoc_id INT NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            provider VARCHAR(50) DEFAULT 'sandbox',
            status ENUM('pending','paid','failed','refunded') DEFAULT 'paid',
            txn_ref VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )
    
    # Nếu bảng đã tồn tại nhưng chưa có 'refunded' trong ENUM, cần ALTER
    try:
        cur.execute("ALTER TABLE payments MODIFY status ENUM('pending','paid','failed','refunded') DEFAULT 'paid'")
    except:
        pass  # Bỏ qua nếu đã có hoặc lỗi

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
    
    # Đảm bảo bảng lich_hoc có trường bai_giang
    try:
        cur.execute("ALTER TABLE lich_hoc ADD COLUMN bai_giang VARCHAR(500) NULL AFTER link_zoom")
    except:
        pass  # Bỏ qua nếu đã có


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

    # Tính tỷ lệ điểm danh: chỉ tính nếu có buổi học
    if total_sessions > 0:
        attendance_ratio = present_count / total_sessions
        attendance_met = attendance_ratio >= 0.7
    else:
        attendance_ratio = 0.0
        attendance_met = True  # Không có buổi học thì không yêu cầu điểm danh

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
    
    # Tính tỷ lệ bài tập: chỉ tính nếu có bài tập bắt buộc
    if total_req > 0:
        assignment_ratio = submitted_req / total_req
        assignment_met = submitted_req == total_req
    else:
        assignment_ratio = 0.0
        assignment_met = True  # Không có bài tập bắt buộc thì không yêu cầu nộp bài

    # Tính tỷ lệ tiến độ tổng
    if total_sessions > 0 and total_req > 0:
        progress_ratio = (attendance_ratio + assignment_ratio) / 2
    elif total_sessions > 0:
        progress_ratio = attendance_ratio
    elif total_req > 0:
        progress_ratio = assignment_ratio
    else:
        progress_ratio = 0.0  # Không có buổi học và bài tập thì tiến độ = 0

    # Hoàn thành khi: đạt yêu cầu điểm danh VÀ đạt yêu cầu bài tập
    # Và phải có ít nhất một trong hai (buổi học hoặc bài tập)
    completed = attendance_met and assignment_met and (total_sessions > 0 or total_req > 0)

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

@app.route('/student/learn/<int:course_id>')
@login_required
def student_learn(course_id):
    """Trang học tập cho học viên"""
    user_id = session['user_id']
    if session.get('role') != 'student':
        flash('Chỉ học viên mới có thể truy cập trang này', 'warning')
        return redirect(url_for('dashboard'))
    
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    ensure_discussion_table(cur)
    
    # Kiểm tra đã đăng ký chưa
    cur.execute("""
        SELECT dkkh.*, kh.*
        FROM dang_ky_khoa_hoc dkkh
        JOIN khoa_hoc kh ON dkkh.khoa_hoc_id = kh.id
        WHERE dkkh.user_id = %s AND dkkh.khoa_hoc_id = %s AND dkkh.trang_thai = 'active'
    """, (user_id, course_id))
    enrollment = cur.fetchone()
    
    if not enrollment:
        flash('Bạn chưa đăng ký khóa học này', 'warning')
        cur.close()
        return redirect(url_for('dashboard'))
    
    course = enrollment
    
    # Lấy thông tin giáo viên
    teacher = None
    if course.get('teacher_id'):
        cur.execute("SELECT * FROM users WHERE id = %s", (course['teacher_id'],))
        teacher = cur.fetchone()
    
    # Lấy nội dung khóa học
    cur.execute("""
        SELECT * FROM chi_tiet_khoa_hoc 
        WHERE khoa_hoc_id = %s 
        ORDER BY thu_tu ASC
    """, (course_id,))
    course_content = cur.fetchall()
    
    # Lấy lịch học
    cur.execute("""
        SELECT * FROM lich_hoc 
        WHERE khoa_hoc_id = %s 
        ORDER BY ngay_hoc, gio_bat_dau
    """, (course_id,))
    schedule_raw = cur.fetchall()
    
    # Xử lý time fields (có thể là timedelta từ MySQL)
    schedule = []
    for s in schedule_raw:
        s_dict = dict(s)
        # Convert timedelta to string nếu cần
        if s_dict.get('gio_bat_dau'):
            if hasattr(s_dict['gio_bat_dau'], 'total_seconds'):
                # Là timedelta
                total_seconds = int(s_dict['gio_bat_dau'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                s_dict['gio_bat_dau'] = f"{hours:02d}:{minutes:02d}"
            elif hasattr(s_dict['gio_bat_dau'], 'strftime'):
                # Là time object
                s_dict['gio_bat_dau'] = s_dict['gio_bat_dau'].strftime('%H:%M')
            else:
                s_dict['gio_bat_dau'] = str(s_dict['gio_bat_dau'])
        
        if s_dict.get('gio_ket_thuc'):
            if hasattr(s_dict['gio_ket_thuc'], 'total_seconds'):
                # Là timedelta
                total_seconds = int(s_dict['gio_ket_thuc'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                s_dict['gio_ket_thuc'] = f"{hours:02d}:{minutes:02d}"
            elif hasattr(s_dict['gio_ket_thuc'], 'strftime'):
                # Là time object
                s_dict['gio_ket_thuc'] = s_dict['gio_ket_thuc'].strftime('%H:%M')
            else:
                s_dict['gio_ket_thuc'] = str(s_dict['gio_ket_thuc'])
        
        schedule.append(s_dict)
    
    # Lấy bài tập
    cur.execute("""
        SELECT bt.*, 
               (SELECT COUNT(*) FROM nop_bai WHERE bai_tap_id = bt.id AND user_id = %s) as has_submitted
        FROM bai_tap bt
        WHERE bt.khoa_hoc_id = %s
        ORDER BY bt.created_at DESC
    """, (user_id, course_id))
    assignments = cur.fetchall()
    
    # Lấy thảo luận
    cur.execute("""
        SELECT tl.*, u.ho_ten, u.role
        FROM thao_luan tl
        JOIN users u ON tl.user_id = u.id
        WHERE tl.khoa_hoc_id = %s
        ORDER BY tl.created_at DESC
        LIMIT 50
    """, (course_id,))
    discussions = cur.fetchall()
    
    # Tính tiến độ
    progress = compute_progress(cur, course_id, user_id)
    
    # Lấy điểm danh của học viên
    cur.execute("""
        SELECT dd.*, lh.ngay_hoc, lh.gio_bat_dau, lh.id as lich_hoc_id
        FROM diem_danh dd
        JOIN lich_hoc lh ON dd.lich_hoc_id = lh.id
        WHERE lh.khoa_hoc_id = %s AND dd.user_id = %s
        ORDER BY lh.ngay_hoc DESC
    """, (course_id, user_id))
    attendance_records = cur.fetchall()
    
    # Lấy ngày hôm nay để so sánh
    today = datetime.now().date()
    
    cur.close()
    
    return render_template('student/learn.html', 
                         course=course,
                         teacher=teacher,
                         course_content=course_content,
                         schedule=schedule,
                         assignments=assignments,
                         discussions=discussions,
                         progress=progress,
                         attendance_records=attendance_records,
                         today=today)

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

    # Kiểm tra user đã đăng ký chưa
    is_enrolled = False
    if 'user_id' in session:
        cur.execute(
            "SELECT id FROM dang_ky_khoa_hoc WHERE user_id=%s AND khoa_hoc_id=%s AND trang_thai='active'",
            (session['user_id'], course_id),
        )
        is_enrolled = cur.fetchone() is not None

    cur.close()
    return render_template('course_detail.html', course=course, details=details, reviews=reviews, discussions=discussions, is_enrolled=is_enrolled)

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
        # Thống kê admin đầy đủ
        cur.execute("SELECT COUNT(*) as total FROM users WHERE role = 'student'")
        total_students = cur.fetchone()['total']
        
        cur.execute("SELECT COUNT(*) as total FROM users WHERE role = 'teacher'")
        total_teachers = cur.fetchone()['total']
        
        cur.execute("SELECT COUNT(*) as total FROM khoa_hoc")
        total_courses = cur.fetchone()['total']
        
        cur.execute("SELECT COUNT(*) as total FROM dang_ky_khoa_hoc WHERE trang_thai = 'active'")
        total_enrollments = cur.fetchone()['total']
        
        # Số lớp học trong ngày hôm nay
        today = datetime.now().date()
        cur.execute("""
            SELECT COUNT(*) as total 
            FROM lich_hoc 
            WHERE DATE(ngay_hoc) = %s
        """, (today,))
        classes_today = cur.fetchone()['total']
        
        # Doanh thu (tổng tiền đã thanh toán)
        cur.execute("""
            SELECT COALESCE(SUM(amount), 0) as total_revenue 
            FROM payments 
            WHERE status = 'paid'
        """)
        total_revenue = cur.fetchone()['total_revenue'] or 0
        
        # Doanh thu hôm nay
        cur.execute("""
            SELECT COALESCE(SUM(amount), 0) as today_revenue 
            FROM payments 
            WHERE status = 'paid' AND DATE(created_at) = %s
        """, (today,))
        today_revenue = cur.fetchone()['today_revenue'] or 0
        
        cur.close()
        return render_template('admin/dashboard.html', 
                             total_students=total_students,
                             total_teachers=total_teachers,
                             total_courses=total_courses,
                             total_enrollments=total_enrollments,
                             classes_today=classes_today,
                             total_revenue=total_revenue,
                             today_revenue=today_revenue)
    
    cur.close()
    return redirect(url_for('index'))

# ==================== API ROUTES ====================

# Route enroll cũ đã được thay thế bằng buy_course (yêu cầu thanh toán)

# ==================== THANH TOÁN / MUA KHÓA HỌC ====================

@app.route('/course/<int:course_id>/checkout')
@login_required
def checkout(course_id):
    """Trang thanh toán"""
    cur = mysql.connection.cursor()
    
    # Lấy thông tin khóa học
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND trang_thai='active'", (course_id,))
    course = cur.fetchone()
    
    if not course:
        flash('Khóa học không tồn tại', 'danger')
        cur.close()
        return redirect(url_for('courses'))
    
    # Kiểm tra đã đăng ký chưa
    cur.execute(
        "SELECT id, trang_thai FROM dang_ky_khoa_hoc WHERE user_id=%s AND khoa_hoc_id=%s",
        (session['user_id'], course_id),
    )
    existing_enrollment = cur.fetchone()
    
    if existing_enrollment and existing_enrollment['trang_thai'] == 'active':
        flash('Bạn đã đăng ký khóa học này rồi', 'info')
        cur.close()
        return redirect(url_for('dashboard'))
    
    cur.close()
    return render_template('checkout.html', course=course)

@app.route('/course/<int:course_id>/checkout/process', methods=['POST'])
@login_required
def process_payment(course_id):
    """Xử lý thanh toán"""
    user_id = session['user_id']
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)

    # Kiểm tra khóa học
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND trang_thai='active'", (course_id,))
    course = cur.fetchone()
    if not course:
        flash('Khóa học không tồn tại', 'danger')
        cur.close()
        return redirect(url_for('courses'))
    
    # Kiểm tra đã đăng ký chưa
    cur.execute(
        "SELECT id, trang_thai FROM dang_ky_khoa_hoc WHERE user_id=%s AND khoa_hoc_id=%s",
        (user_id, course_id),
    )
    existing_enrollment = cur.fetchone()
    
    if existing_enrollment:
        if existing_enrollment['trang_thai'] == 'active':
            flash('Bạn đã đăng ký khóa học này rồi', 'warning')
            cur.close()
            return redirect(url_for('dashboard'))
        elif existing_enrollment['trang_thai'] == 'cancelled':
            # Cập nhật enrollment từ cancelled thành active
    cur.execute("""
                UPDATE dang_ky_khoa_hoc 
                SET trang_thai = 'active', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (existing_enrollment['id'],))
            enrollment_updated = True
        else:
            enrollment_updated = False
    else:
        enrollment_updated = False

    amount = course.get('gia', 0) or 0
    payment_method = request.form.get('payment_method', 'sandbox')

    # Tạo bản ghi thanh toán
    txn_ref = f'TXN-{course_id}-{user_id}-{int(datetime.now().timestamp())}'
    cur.execute(
        """
        INSERT INTO payments (user_id, khoa_hoc_id, amount, provider, status, txn_ref)
        VALUES (%s,%s,%s,%s,%s,%s)
        """,
        (user_id, course_id, amount, payment_method, 'paid', txn_ref),
    )

    # Chỉ tạo enrollment mới nếu chưa có hoặc chưa được cập nhật
    if not enrollment_updated:
        cur.execute(
            """
            INSERT INTO dang_ky_khoa_hoc (user_id, khoa_hoc_id, trang_thai)
            VALUES (%s,%s,'active')
            """,
            (user_id, course_id),
        )

    mysql.connection.commit()
        cur.close()
    
    flash(f'Thanh toán thành công {amount:,.0f} VNĐ! Bạn đã được ghi danh vào khóa học.', 'success')
    return redirect(url_for('payment_success', course_id=course_id))

@app.route('/course/<int:course_id>/payment/success')
@login_required
def payment_success(course_id):
    """Trang thành công sau thanh toán"""
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s", (course_id,))
    course = cur.fetchone()
    cur.close()
    
    if not course:
        return redirect(url_for('dashboard'))
    
    return render_template('payment_success.html', course=course)

@app.route('/course/<int:course_id>/buy', methods=['POST'])
@login_required
def buy_course(course_id):
    """Mua khóa học - yêu cầu thanh toán"""
    user_id = session['user_id']
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)

    # Kiểm tra khóa học
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND trang_thai='active'", (course_id,))
    course = cur.fetchone()
    if not course:
        cur.close()
        return jsonify({'success': False, 'message': 'Khóa học không tồn tại'}), 404

    # Kiểm tra đã đăng ký chưa (chỉ kiểm tra status active)
    cur.execute(
        "SELECT id, trang_thai FROM dang_ky_khoa_hoc WHERE user_id=%s AND khoa_hoc_id=%s",
        (user_id, course_id),
    )
    existing_enrollment = cur.fetchone()
    
    amount = course.get('gia', 0) or 0
    
    # Kiểm tra và xử lý enrollment
    if existing_enrollment:
        # Nếu đã có enrollment active thì không cho đăng ký lại
        if existing_enrollment['trang_thai'] == 'active':
            cur.close()
            return jsonify({'success': False, 'message': 'Bạn đã đăng ký khóa học này rồi'}), 400
        # Nếu enrollment đã bị cancelled, cập nhật lại thành active
        elif existing_enrollment['trang_thai'] == 'cancelled':
    cur.execute("""
                UPDATE dang_ky_khoa_hoc 
                SET trang_thai = 'active', updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (existing_enrollment['id'],))
            # Không tạo enrollment mới, chỉ tạo payment
            enrollment_updated = True
        else:
            enrollment_updated = False
    else:
        enrollment_updated = False

    # Tạo bản ghi thanh toán (giả lập - tự động thành công)
    txn_ref = f'TXN-{course_id}-{user_id}-{int(datetime.now().timestamp())}'
    cur.execute(
        """
        INSERT INTO payments (user_id, khoa_hoc_id, amount, provider, status, txn_ref)
        VALUES (%s,%s,%s,%s,%s,%s)
        """,
        (user_id, course_id, amount, 'sandbox', 'paid', txn_ref),
    )

    # Chỉ tạo enrollment mới nếu chưa có hoặc chưa được cập nhật
    if not enrollment_updated:
        cur.execute(
            """
        INSERT INTO dang_ky_khoa_hoc (user_id, khoa_hoc_id, trang_thai)
            VALUES (%s,%s,'active')
            """,
            (user_id, course_id),
        )

    mysql.connection.commit()
    cur.close()
    return jsonify({'success': True, 'message': f'Thanh toán thành công {amount:,.0f} VNĐ! Bạn đã được ghi danh vào khóa học.'})

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
        return redirect(request.referrer or url_for('course_detail', course_id=course_id))

    cur = mysql.connection.cursor()
    ensure_discussion_table(cur)

    # Kiểm tra học viên đã đăng ký (nếu là student)
    if session.get('role') == 'student':
        cur.execute("""
            SELECT id FROM dang_ky_khoa_hoc 
            WHERE user_id = %s AND khoa_hoc_id = %s AND trang_thai = 'active'
        """, (session['user_id'], course_id))
        if not cur.fetchone():
            flash('Bạn cần đăng ký khóa học để tham gia thảo luận', 'warning')
            cur.close()
            return redirect(url_for('course_detail', course_id=course_id))

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
    return redirect(request.referrer or url_for('course_detail', course_id=course_id))

# ==================== CHỨC NĂNG NÂNG CAO 2: QUẢN LÝ BÀI TẬP ====================

@app.route('/teacher/assignments/<int:course_id>')
@teacher_required
def teacher_assignments(course_id):
    """Quản lý bài tập cho giáo viên"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra giáo viên sở hữu khóa
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    # Lấy danh sách bài tập
    cur.execute("""
        SELECT * FROM bai_tap 
        WHERE khoa_hoc_id=%s 
        ORDER BY created_at DESC
    """, (course_id,))
    assignments = cur.fetchall()
    
    # Lấy số lượng submissions cho mỗi bài tập
    for assignment in assignments:
        cur.execute("""
            SELECT COUNT(*) as total, 
                   COUNT(CASE WHEN trang_thai = 'graded' THEN 1 END) as graded_count
            FROM nop_bai 
            WHERE bai_tap_id = %s
        """, (assignment['id'],))
        stats = cur.fetchone()
        assignment['submission_count'] = stats['total']
        assignment['graded_count'] = stats['graded_count']
    
    cur.close()
    return render_template('teacher/assignments.html', course=course, assignments=assignments)

@app.route('/teacher/assignments/<int:course_id>/create', methods=['GET', 'POST'])
@teacher_required
def teacher_create_assignment(course_id):
    """Tạo bài tập mới (Giáo viên)"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        tieu_de = request.form.get('tieu_de')
        mo_ta = request.form.get('mo_ta', '')
        noi_dung = request.form.get('noi_dung', '')
        han_nop = request.form.get('han_nop') or None
        is_required = 1 if request.form.get('is_required') == 'on' else 0
        
        cur.execute("""
            INSERT INTO bai_tap (khoa_hoc_id, tieu_de, mo_ta, noi_dung, han_nop, is_required)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (course_id, tieu_de, mo_ta, noi_dung, han_nop, is_required))
        mysql.connection.commit()
        cur.close()
        
        flash('Tạo bài tập thành công!', 'success')
        return redirect(url_for('teacher_assignments', course_id=course_id))
    
    cur.close()
    return render_template('teacher/create_assignment.html', course=course)

@app.route('/teacher/assignments/<int:course_id>/<int:assignment_id>/submissions')
@teacher_required
def teacher_view_submissions(course_id, assignment_id):
    """Xem danh sách bài nộp của học viên"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    # Lấy thông tin bài tập
    cur.execute("SELECT * FROM bai_tap WHERE id=%s AND khoa_hoc_id=%s", (assignment_id, course_id))
    assignment = cur.fetchone()
    if not assignment:
        cur.close()
        flash('Không tìm thấy bài tập', 'danger')
        return redirect(url_for('teacher_assignments', course_id=course_id))
    
    # Lấy danh sách submissions
    cur.execute("""
        SELECT nb.*, u.ho_ten, u.email
        FROM nop_bai nb
        JOIN users u ON nb.user_id = u.id
        WHERE nb.bai_tap_id = %s
        ORDER BY nb.created_at DESC
    """, (assignment_id,))
    submissions = cur.fetchall()
    
    cur.close()
    return render_template('teacher/submissions.html', course=course, assignment=assignment, submissions=submissions)

@app.route('/teacher/assignments/<int:course_id>/<int:assignment_id>/grade', methods=['POST'])
@teacher_required
def teacher_grade_submission(course_id, assignment_id):
    """Chấm điểm bài tập"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    submission_id = request.form.get('submission_id')
    diem_so = float(request.form.get('diem_so', 0))
    nhan_xet = request.form.get('nhan_xet', '')
    mark_done = request.form.get('mark_done') == 'on'
    
    # Cập nhật điểm và nhận xét
    cur.execute("""
        UPDATE nop_bai 
        SET diem_so = %s, nhan_xet = %s, trang_thai = %s
        WHERE id = %s
    """, (diem_so, nhan_xet, 'graded' if mark_done else 'graded', submission_id))
    
    mysql.connection.commit()
    cur.close()
    
    flash('Chấm điểm thành công!', 'success')
    return redirect(url_for('teacher_view_submissions', course_id=course_id, assignment_id=assignment_id))

# ==================== QUẢN LÝ LỊCH HỌC ====================

@app.route('/teacher/schedule/<int:course_id>')
@teacher_required
def teacher_schedule(course_id):
    """Quản lý lịch học cho giáo viên"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra giáo viên sở hữu khóa
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    # Lấy danh sách lịch học
    cur.execute("""
        SELECT * FROM lich_hoc 
        WHERE khoa_hoc_id=%s 
        ORDER BY ngay_hoc, gio_bat_dau
    """, (course_id,))
    schedules = cur.fetchall()
    
    cur.close()
    return render_template('teacher/schedule.html', course=course, schedules=schedules)

@app.route('/teacher/schedule/<int:course_id>/create', methods=['POST'])
@teacher_required
def teacher_create_schedule(course_id):
    """Tạo lịch học mới"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    ngay_hoc = request.form.get('ngay_hoc')
    gio_bat_dau = request.form.get('gio_bat_dau')
    gio_ket_thuc = request.form.get('gio_ket_thuc')
    link_zoom = request.form.get('link_zoom', '').strip()
    ghi_chu = request.form.get('ghi_chu', '').strip()
    
    # Xử lý upload bài giảng
    bai_giang = None
    if 'bai_giang_file' in request.files:
        file = request.files['bai_giang_file']
        if file.filename:
            import os
            upload_folder = os.path.join('static', 'uploads', 'lectures', str(course_id))
            os.makedirs(upload_folder, exist_ok=True)
            filename = f"{course_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            bai_giang = '/' + file_path.replace('\\', '/')
    
    # Nếu không có file, dùng link
    if not bai_giang:
        bai_giang_link = request.form.get('bai_giang_link', '').strip()
        if bai_giang_link:
            bai_giang = bai_giang_link
    
    cur.execute("""
        INSERT INTO lich_hoc (khoa_hoc_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, link_zoom, ghi_chu, bai_giang)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (course_id, ngay_hoc, gio_bat_dau, gio_ket_thuc, link_zoom or None, ghi_chu or None, bai_giang or None))
    
    mysql.connection.commit()
    cur.close()
    
    flash('Đã thêm buổi học mới!', 'success')
    return redirect(url_for('teacher_schedule', course_id=course_id))

@app.route('/teacher/schedule/<int:course_id>/<int:schedule_id>/edit', methods=['GET', 'POST'])
@teacher_required
def teacher_edit_schedule(course_id, schedule_id):
    """Sửa lịch học"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    cur.execute("SELECT * FROM lich_hoc WHERE id=%s AND khoa_hoc_id=%s", (schedule_id, course_id))
    schedule = cur.fetchone()
    
    if not schedule:
        cur.close()
        flash('Không tìm thấy buổi học', 'danger')
        return redirect(url_for('teacher_schedule', course_id=course_id))
    
    if request.method == 'POST':
        ngay_hoc = request.form.get('ngay_hoc')
        gio_bat_dau = request.form.get('gio_bat_dau')
        gio_ket_thuc = request.form.get('gio_ket_thuc')
        link_zoom = request.form.get('link_zoom', '').strip()
        ghi_chu = request.form.get('ghi_chu', '').strip()
        
        # Xử lý upload bài giảng mới
        bai_giang = schedule.get('bai_giang')  # Giữ nguyên nếu không upload mới
        if 'bai_giang_file' in request.files:
            file = request.files['bai_giang_file']
            if file.filename:
                import os
                # Xóa file cũ nếu có
                if bai_giang and not bai_giang.startswith('http'):
                    old_path = bai_giang.lstrip('/')
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                        except:
                            pass
                
                upload_folder = os.path.join('static', 'uploads', 'lectures', str(course_id))
                os.makedirs(upload_folder, exist_ok=True)
                filename = f"{course_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
                file_path = os.path.join(upload_folder, filename)
                file.save(file_path)
                bai_giang = '/' + file_path.replace('\\', '/')
        
        # Nếu không có file mới, kiểm tra link
        bai_giang_link = request.form.get('bai_giang_link', '').strip()
        if bai_giang_link and not ('bai_giang_file' in request.files and request.files['bai_giang_file'].filename):
            bai_giang = bai_giang_link
        
        cur.execute("""
            UPDATE lich_hoc 
            SET ngay_hoc=%s, gio_bat_dau=%s, gio_ket_thuc=%s, link_zoom=%s, ghi_chu=%s, bai_giang=%s
            WHERE id=%s
        """, (ngay_hoc, gio_bat_dau, gio_ket_thuc, link_zoom or None, ghi_chu or None, bai_giang or None, schedule_id))
        
        mysql.connection.commit()
        cur.close()
        
        flash('Đã cập nhật buổi học!', 'success')
        return redirect(url_for('teacher_schedule', course_id=course_id))
    
    cur.close()
    return render_template('teacher/edit_schedule.html', course=course, schedule=schedule)

@app.route('/teacher/schedule/<int:course_id>/<int:schedule_id>/delete', methods=['POST'])
@teacher_required
def teacher_delete_schedule(course_id, schedule_id):
    """Xóa lịch học"""
    cur = mysql.connection.cursor()
    
    # Kiểm tra quyền
    cur.execute("SELECT * FROM khoa_hoc WHERE id=%s AND teacher_id=%s", (course_id, session['user_id']))
    course = cur.fetchone()
    if not course:
        cur.close()
        flash('Bạn không có quyền với khóa học này', 'danger')
        return redirect(url_for('dashboard'))
    
    # Xóa file bài giảng nếu có
    cur.execute("SELECT bai_giang FROM lich_hoc WHERE id=%s", (schedule_id,))
    schedule = cur.fetchone()
    if schedule and schedule.get('bai_giang') and not schedule['bai_giang'].startswith('http'):
        import os
        file_path = schedule['bai_giang'].lstrip('/')
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
    
    cur.execute("DELETE FROM lich_hoc WHERE id=%s", (schedule_id,))
    mysql.connection.commit()
    cur.close()
    
    flash('Đã xóa buổi học!', 'success')
    return redirect(url_for('teacher_schedule', course_id=course_id))

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

# ==================== QUẢN LÝ ADMIN ====================

@app.route('/admin/teachers')
@admin_required
def admin_teachers():
    """Quản lý giáo viên"""
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT u.*, COUNT(kh.id) as so_lop_hoc
        FROM users u
        LEFT JOIN khoa_hoc kh ON u.id = kh.teacher_id
        WHERE u.role = 'teacher'
        GROUP BY u.id
        ORDER BY u.created_at DESC
    """)
    teachers = cur.fetchall()
    cur.close()
    return render_template('admin/teachers.html', teachers=teachers)

@app.route('/admin/teachers/create', methods=['GET', 'POST'])
@admin_required
def admin_create_teacher():
    """Tạo giáo viên mới"""
    if request.method == 'POST':
        ho_ten = request.form.get('ho_ten')
        email = request.form.get('email')
        password = request.form.get('password')
        so_dien_thoai = request.form.get('so_dien_thoai', '')
        
        cur = mysql.connection.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            flash('Email đã được sử dụng', 'danger')
            cur.close()
            return render_template('admin/create_teacher.html')
        
        password_hash = generate_password_hash(password)
        cur.execute("""
            INSERT INTO users (ho_ten, email, password_hash, so_dien_thoai, role)
            VALUES (%s, %s, %s, %s, 'teacher')
        """, (ho_ten, email, password_hash, so_dien_thoai))
        mysql.connection.commit()
        cur.close()
        
        flash('Tạo giáo viên thành công!', 'success')
        return redirect(url_for('admin_teachers'))
    
    return render_template('admin/create_teacher.html')

@app.route('/admin/teachers/<int:teacher_id>/delete', methods=['POST'])
@admin_required
def admin_delete_teacher(teacher_id):
    """Xóa giáo viên"""
    cur = mysql.connection.cursor()
    cur.execute("SELECT role FROM users WHERE id = %s", (teacher_id,))
    user = cur.fetchone()
    if not user or user['role'] != 'teacher':
        flash('Không tìm thấy giáo viên', 'danger')
        cur.close()
        return redirect(url_for('admin_teachers'))
    
    cur.execute("DELETE FROM users WHERE id = %s", (teacher_id,))
    mysql.connection.commit()
    cur.close()
    flash('Đã xóa giáo viên', 'success')
    return redirect(url_for('admin_teachers'))

@app.route('/admin/courses')
@admin_required
def admin_courses():
    """Quản lý khóa học"""
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT kh.*, u.ho_ten as teacher_name,
               COUNT(DISTINCT dkkh.id) as so_hoc_vien
        FROM khoa_hoc kh
        LEFT JOIN users u ON kh.teacher_id = u.id
        LEFT JOIN dang_ky_khoa_hoc dkkh ON kh.id = dkkh.khoa_hoc_id
        GROUP BY kh.id
        ORDER BY kh.created_at DESC
    """)
    courses = cur.fetchall()
    cur.close()
    return render_template('admin/courses.html', courses=courses)

@app.route('/admin/courses/create', methods=['GET', 'POST'])
@admin_required
def admin_create_course():
    """Tạo khóa học mới"""
    if request.method == 'POST':
        tieu_de = request.form.get('tieu_de')
        mo_ta = request.form.get('mo_ta', '')
        cap_do = request.form.get('cap_do', 'Beginner')
        gia = float(request.form.get('gia', 0))
        so_buoi = int(request.form.get('so_buoi', 0))
        thoi_luong = request.form.get('thoi_luong', '')
        hinh_thuc = request.form.get('hinh_thuc', 'online')
        teacher_id = int(request.form.get('teacher_id', 0)) or None
        
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO khoa_hoc (tieu_de, mo_ta, cap_do, gia, so_buoi, thoi_luong, hinh_thuc, teacher_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (tieu_de, mo_ta, cap_do, gia, so_buoi, thoi_luong, hinh_thuc, teacher_id))
        mysql.connection.commit()
        cur.close()
        
        flash('Tạo khóa học thành công!', 'success')
        return redirect(url_for('admin_courses'))
    
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, ho_ten FROM users WHERE role = 'teacher'")
    teachers = cur.fetchall()
    cur.close()
    return render_template('admin/create_course.html', teachers=teachers)

@app.route('/admin/courses/<int:course_id>/delete', methods=['POST'])
@admin_required
def admin_delete_course(course_id):
    """Xóa khóa học"""
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM khoa_hoc WHERE id = %s", (course_id,))
    mysql.connection.commit()
    cur.close()
    flash('Đã xóa khóa học', 'success')
    return redirect(url_for('admin_courses'))

@app.route('/student/payments')
@login_required
def student_payments():
    """Lịch sử thanh toán của học viên"""
    user_id = session['user_id']
    if session.get('role') != 'student':
        flash('Chỉ học viên mới có thể truy cập trang này', 'warning')
        return redirect(url_for('dashboard'))
    
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    
    cur.execute("""
        SELECT p.*, kh.tieu_de as course_name, kh.hinh_anh
        FROM payments p
        JOIN khoa_hoc kh ON p.khoa_hoc_id = kh.id
        WHERE p.user_id = %s
        ORDER BY p.created_at DESC
    """, (user_id,))
    payments = cur.fetchall()
    
    # Tính tổng tiền đã thanh toán và hoàn tiền
    cur.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid_only,
            COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as total_refunded
        FROM payments
        WHERE user_id = %s
    """, (user_id,))
    stats = cur.fetchone()
    total_paid_only = stats['total_paid_only'] or 0
    total_refunded = stats['total_refunded'] or 0
    total_paid = total_paid_only - total_refunded
    
    cur.close()
    return render_template('student/payments.html', 
                         payments=payments, 
                         total_paid=total_paid,
                         total_paid_only=total_paid_only,
                         total_refunded=total_refunded)

@app.route('/admin/payments')
@admin_required
def admin_payments():
    """Quản lý thanh toán"""
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    
    cur.execute("""
        SELECT p.*, u.ho_ten, u.email, kh.tieu_de as course_name
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN khoa_hoc kh ON p.khoa_hoc_id = kh.id
        ORDER BY p.created_at DESC
        LIMIT 100
    """)
    payments = cur.fetchall()
    
    # Thống kê
    cur.execute("""
        SELECT 
            COUNT(*) as total_count,
            COALESCE(SUM(amount), 0) as total_amount,
            COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_count,
            COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN amount ELSE 0 END), 0) as today_amount
        FROM payments
        WHERE status = 'paid'
    """)
    stats = cur.fetchone()
    cur.close()
    
    return render_template('admin/payments.html', payments=payments, stats=stats)

@app.route('/admin/enrollments')
@admin_required
def admin_enrollments():
    """Quản lý đăng ký khóa học"""
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    
    cur.execute("""
        SELECT dkkh.*, u.ho_ten, u.email, kh.tieu_de as course_name, kh.gia
        FROM dang_ky_khoa_hoc dkkh
        JOIN users u ON dkkh.user_id = u.id
        JOIN khoa_hoc kh ON dkkh.khoa_hoc_id = kh.id
        ORDER BY dkkh.created_at DESC
    """)
    enrollments = cur.fetchall()
    
    # Kiểm tra refund status cho mỗi enrollment
    for enrollment in enrollments:
        # Kiểm tra có payment gốc không
        cur.execute("""
            SELECT * FROM payments 
            WHERE user_id = %s AND khoa_hoc_id = %s AND status = 'paid'
            ORDER BY created_at DESC
            LIMIT 1
        """, (enrollment['user_id'], enrollment['khoa_hoc_id']))
        original_payment = cur.fetchone()
        
        enrollment['has_payment'] = original_payment is not None
        enrollment['has_refund'] = False
        
        if original_payment and enrollment['trang_thai'] == 'cancelled':
            # Kiểm tra đã có refund chưa
            cur.execute("""
                SELECT * FROM payments 
                WHERE user_id = %s AND khoa_hoc_id = %s AND status = 'refunded' 
                AND txn_ref LIKE %s
            """, (enrollment['user_id'], enrollment['khoa_hoc_id'], f'REFUND-{original_payment["txn_ref"]}%'))
            existing_refund = cur.fetchone()
            enrollment['has_refund'] = existing_refund is not None
            enrollment['refund_amount'] = original_payment['amount'] if original_payment else 0
        else:
            enrollment['refund_amount'] = 0
    
    cur.close()
    
    return render_template('admin/enrollments.html', enrollments=enrollments)

@app.route('/admin/enrollments/<int:enrollment_id>/cancel', methods=['POST'])
@admin_required
def admin_cancel_enrollment(enrollment_id):
    """Hủy đăng ký khóa học của học viên và hoàn tiền"""
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    
    cur.execute("""
        SELECT dkkh.*, u.ho_ten, kh.tieu_de, kh.gia
        FROM dang_ky_khoa_hoc dkkh
        JOIN users u ON dkkh.user_id = u.id
        JOIN khoa_hoc kh ON dkkh.khoa_hoc_id = kh.id
        WHERE dkkh.id = %s
    """, (enrollment_id,))
    enrollment = cur.fetchone()
    
    if not enrollment:
        flash('Không tìm thấy đăng ký', 'danger')
        cur.close()
        return redirect(url_for('admin_enrollments'))
    
    # Kiểm tra đã bị hủy chưa
    if enrollment['trang_thai'] == 'cancelled':
        flash('Đăng ký này đã bị hủy rồi', 'warning')
        cur.close()
        return redirect(url_for('admin_enrollments'))
    
    # Tìm payment gốc để hoàn tiền
    cur.execute("""
        SELECT * FROM payments 
        WHERE user_id = %s AND khoa_hoc_id = %s AND status = 'paid'
        ORDER BY created_at DESC
        LIMIT 1
    """, (enrollment['user_id'], enrollment['khoa_hoc_id']))
    original_payment = cur.fetchone()
    
    # Kiểm tra đã có refund chưa
    if original_payment:
        cur.execute("""
            SELECT * FROM payments 
            WHERE user_id = %s AND khoa_hoc_id = %s AND status = 'refunded' 
            AND txn_ref LIKE %s
        """, (enrollment['user_id'], enrollment['khoa_hoc_id'], f'REFUND-{original_payment["txn_ref"]}%'))
        existing_refund = cur.fetchone()
        if existing_refund:
            flash('Đã có giao dịch hoàn tiền cho đăng ký này rồi', 'info')
            cur.close()
            return redirect(url_for('admin_enrollments'))
    
    # Hủy enrollment
    cur.execute("""
        UPDATE dang_ky_khoa_hoc 
        SET trang_thai = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (enrollment_id,))
    
    # Tạo payment hoàn tiền (refund)
    if original_payment:
        refund_amount = original_payment['amount']
        refund_txn_ref = f'REFUND-{original_payment["txn_ref"]}'
        cur.execute("""
            INSERT INTO payments (user_id, khoa_hoc_id, amount, provider, status, txn_ref)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            enrollment['user_id'], 
            enrollment['khoa_hoc_id'], 
            refund_amount,
            'refund',
            'refunded',
            refund_txn_ref
        ))
        flash(f'Đã hủy đăng ký và hoàn tiền {refund_amount:,.0f} VNĐ cho {enrollment["ho_ten"]}', 'success')
    else:
        flash(f'Đã hủy đăng ký của {enrollment["ho_ten"]} (không tìm thấy giao dịch thanh toán để hoàn tiền)', 'warning')
    
    mysql.connection.commit()
    cur.close()
    
    return redirect(url_for('admin_enrollments'))

@app.route('/admin/enrollments/<int:enrollment_id>/refund', methods=['POST'])
@admin_required
def admin_create_refund(enrollment_id):
    """Tạo hoàn tiền cho enrollment đã bị hủy nhưng chưa có refund"""
    cur = mysql.connection.cursor()
    ensure_extended_tables(cur)
    
    cur.execute("""
        SELECT dkkh.*, u.ho_ten, kh.tieu_de, kh.gia
        FROM dang_ky_khoa_hoc dkkh
        JOIN users u ON dkkh.user_id = u.id
        JOIN khoa_hoc kh ON dkkh.khoa_hoc_id = kh.id
        WHERE dkkh.id = %s
    """, (enrollment_id,))
    enrollment = cur.fetchone()
    
    if not enrollment:
        flash('Không tìm thấy đăng ký', 'danger')
        cur.close()
        return redirect(url_for('admin_enrollments'))
    
    # Tìm payment gốc
    cur.execute("""
        SELECT * FROM payments 
        WHERE user_id = %s AND khoa_hoc_id = %s AND status = 'paid'
        ORDER BY created_at DESC
        LIMIT 1
    """, (enrollment['user_id'], enrollment['khoa_hoc_id']))
    original_payment = cur.fetchone()
    
    if not original_payment:
        flash('Không tìm thấy giao dịch thanh toán gốc', 'warning')
        cur.close()
        return redirect(url_for('admin_enrollments'))
    
    # Kiểm tra đã có refund chưa
    cur.execute("""
        SELECT * FROM payments 
        WHERE user_id = %s AND khoa_hoc_id = %s AND status = 'refunded' 
        AND txn_ref LIKE %s
    """, (enrollment['user_id'], enrollment['khoa_hoc_id'], f'REFUND-{original_payment["txn_ref"]}%'))
    existing_refund = cur.fetchone()
    
    if existing_refund:
        flash('Đã có giao dịch hoàn tiền cho đăng ký này rồi', 'info')
        cur.close()
        return redirect(url_for('admin_enrollments'))
    
    # Tạo refund
    refund_amount = original_payment['amount']
    refund_txn_ref = f'REFUND-{original_payment["txn_ref"]}'
    cur.execute("""
        INSERT INTO payments (user_id, khoa_hoc_id, amount, provider, status, txn_ref)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        enrollment['user_id'], 
        enrollment['khoa_hoc_id'], 
        refund_amount,
        'refund',
        'refunded',
        refund_txn_ref
    ))
    mysql.connection.commit()
    cur.close()
    
    flash(f'Đã tạo hoàn tiền {refund_amount:,.0f} VNĐ cho {enrollment["ho_ten"]}', 'success')
    return redirect(url_for('admin_enrollments'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

