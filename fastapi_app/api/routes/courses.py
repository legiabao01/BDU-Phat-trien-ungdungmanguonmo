from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from ...db.session import get_db
from ...models.course import Course, CourseStatus, CourseMode
from ...schemas.course import CourseCreate, CourseOut
from ...api.deps import get_current_active_user
from ...models.user import User

router = APIRouter()


@router.get("/courses")
def list_courses(
    q: str | None = Query(None, description="Tìm theo tiêu đề/mô tả"),
    cap_do: str | None = Query(None, description="Lọc cấp độ (Beginner/Intermediate/Advanced)"),
    hinh_thuc: CourseMode | None = Query(None, description="online/offline/hybrid"),
    status: CourseStatus | None = Query(None, description="active/inactive/draft"),
    sort: str | None = Query("newest", description="newest|price_asc|price_desc"),
    db: Session = Depends(get_db),
):
    """
    Lấy danh sách khóa học.
    Luôn trả về array [] (không bao giờ trả về object {}).
    """
    try:
        query = db.query(Course)

        if status:
            query = query.filter(Course.trang_thai == status)
        else:
            # Mặc định chỉ trả active
            query = query.filter(Course.trang_thai == CourseStatus.active)

        if cap_do:
            query = query.filter(Course.cap_do == cap_do)

        if hinh_thuc:
            query = query.filter(Course.hinh_thuc == hinh_thuc)

        if q:
            like_q = f"%{q}%"
            query = query.filter(or_(Course.tieu_de.ilike(like_q), Course.mo_ta.ilike(like_q)))

        if sort == "price_asc":
            query = query.order_by(Course.gia.asc())
        elif sort == "price_desc":
            query = query.order_by(Course.gia.desc())
        else:
            query = query.order_by(Course.created_at.desc())

        # query.all() luôn trả về list (có thể rỗng), không bao giờ None
        result = query.all()
        
        # Đảm bảo chắc chắn là list
        if not isinstance(result, list):
            result = []
        
        # Convert sang Pydantic models để serialize đúng
        courses_list = []
        for course in result:
            try:
                course_dict = {
                    "id": course.id,
                    "tieu_de": course.tieu_de,
                    "mo_ta": course.mo_ta,
                    "cap_do": course.cap_do,
                    "hinh_anh": course.hinh_anh,
                    "gia": float(course.gia) if course.gia else 0.0,
                    "gia_goc": float(course.gia_goc) if course.gia_goc else None,
                    "so_buoi": course.so_buoi or 0,
                    "thoi_luong": course.thoi_luong,
                    "hinh_thuc": course.hinh_thuc.value if course.hinh_thuc else "online",
                    "teacher_id": course.teacher_id,
                }
                courses_list.append(course_dict)
            except Exception as e:
                print(f"Error serializing course {course.id}: {e}")
                continue
        
        # Trả về JSONResponse trực tiếp để đảm bảo là array
        return JSONResponse(content=courses_list)
    except Exception as e:
        # Nếu có bất kỳ lỗi nào, trả về list rỗng
        print(f"Error fetching courses: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content=[])


@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    return course


@router.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Tạo khóa học - giáo viên hoặc admin"""
    from ...models.user import UserRole
    
    # Giáo viên chỉ tạo được khóa học cho chính mình
    teacher_id = payload.teacher_id
    if current_user.role == UserRole.teacher:
        teacher_id = current_user.id
    elif current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ giáo viên hoặc admin mới có quyền")
    
    # Khóa học mới tạo sẽ ở trạng thái draft
    course = Course(
        tieu_de=payload.tieu_de,
        mo_ta=payload.mo_ta,
        cap_do=payload.cap_do,
        hinh_anh=payload.hinh_anh,
        gia=payload.gia,
        gia_goc=payload.gia_goc,
        so_buoi=payload.so_buoi,
        thoi_luong=payload.thoi_luong,
        hinh_thuc=payload.hinh_thuc,
        teacher_id=teacher_id,
        trang_thai=CourseStatus.draft  # Mặc định là draft, cần admin duyệt
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/admin/courses/{course_id}/approve", response_model=CourseOut)
def approve_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Duyệt khóa học - chỉ admin"""
    from ...models.user import UserRole
    
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    course.trang_thai = CourseStatus.active
    db.commit()
    db.refresh(course)
    return course


@router.put("/admin/courses/{course_id}/status", response_model=CourseOut)
def update_course_status(
    course_id: int,
    status: CourseStatus = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cập nhật trạng thái khóa học (active/inactive/draft) - chỉ admin"""
    from ...models.user import UserRole
    
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    course.trang_thai = status
    db.commit()
    db.refresh(course)
    return course


@router.put("/admin/courses/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Chỉnh sửa nội dung khóa học - chỉ admin"""
    from ...models.user import UserRole
    
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    # Cập nhật các trường
    course.tieu_de = payload.tieu_de
    course.mo_ta = payload.mo_ta
    course.cap_do = payload.cap_do
    course.hinh_anh = payload.hinh_anh
    course.gia = payload.gia
    course.gia_goc = payload.gia_goc
    course.so_buoi = payload.so_buoi
    course.thoi_luong = payload.thoi_luong
    course.hinh_thuc = payload.hinh_thuc
    if payload.teacher_id:
        course.teacher_id = payload.teacher_id
    
    db.commit()
    db.refresh(course)
    return course


@router.get("/admin/courses/pending", response_model=list[CourseOut])
def list_pending_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Danh sách khóa học chờ duyệt - chỉ admin"""
    from ...models.user import UserRole
    
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chỉ admin mới có quyền")
    
    try:
        courses = db.query(Course).filter(Course.trang_thai == CourseStatus.draft).order_by(Course.created_at.desc()).all()
        # Đảm bảo chắc chắn là list
        if not isinstance(courses, list):
            return []
        return courses
    except Exception as e:
        print(f"Error fetching pending courses: {e}")
        import traceback
        traceback.print_exc()
        return []

