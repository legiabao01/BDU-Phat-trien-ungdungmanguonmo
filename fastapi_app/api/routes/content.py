from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import os
import json
from datetime import datetime

from ...db.session import get_db
from ...models.course_content import CourseContent
from ...models.course import Course
from ...schemas.content import ContentCreate, ContentOut
from ...api.deps import get_current_active_user
from ...models.user import User

router = APIRouter()

# Tạo thư mục uploads nếu chưa có
UPLOAD_DIR = "static/uploads/videos"
PDF_DIR = "static/uploads/pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)


@router.get("/courses/{course_id}/lessons", response_model=list[ContentOut])
def list_lessons(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    return db.query(CourseContent).filter(CourseContent.khoa_hoc_id == course_id).order_by(CourseContent.thu_tu).all()


@router.post("/courses/{course_id}/lessons", response_model=ContentOut, status_code=status.HTTP_201_CREATED)
def create_lesson(
    course_id: int,
    tieu_de_muc: str = Form(...),
    noi_dung: Optional[str] = Form(None),
    thu_tu: int = Form(0),
    is_unlocked: bool = Form(True),
    unlock_date: Optional[str] = Form(None),
    video_path: Optional[str] = Form(None),
    video_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Kiểm tra khóa học tồn tại
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khóa học không tồn tại")
    
    # Xử lý file upload nếu có
    final_video_path = video_path
    if video_file:
        # Lưu file video
        file_ext = os.path.splitext(video_file.filename)[1]
        filename = f"{course_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            content = video_file.file.read()
            buffer.write(content)
        
        final_video_path = f"/static/uploads/videos/{filename}"
    
    # Parse unlock_date nếu có
    unlock_dt = None
    if unlock_date:
        try:
            unlock_dt = datetime.fromisoformat(unlock_date.replace('Z', '+00:00'))
        except:
            pass
    
    lesson = CourseContent(
        khoa_hoc_id=course_id,
        tieu_de_muc=tieu_de_muc,
        noi_dung=noi_dung,
        thu_tu=thu_tu,
        is_unlocked=is_unlocked,
        unlock_date=unlock_dt,
        video_path=final_video_path,
        tai_lieu_links=[],
        resources=[]
    )
    
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.put("/lessons/{lesson_id}", response_model=ContentOut)
def update_lesson(
    lesson_id: int,
    tieu_de_muc: Optional[str] = Form(None),
    noi_dung: Optional[str] = Form(None),
    video_path: Optional[str] = Form(None),
    video_file: Optional[UploadFile] = File(None),
    tai_lieu_pdf_file: Optional[UploadFile] = File(None),
    tai_lieu_links: Optional[str] = Form(None),  # JSON string
    resources: Optional[str] = Form(None),  # JSON string
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    lesson = db.query(CourseContent).filter(CourseContent.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bài học không tồn tại")
    
    # Kiểm tra quyền: chỉ teacher của khóa học hoặc admin
    course = db.query(Course).filter(Course.id == lesson.khoa_hoc_id).first()
    if course and course.teacher_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền chỉnh sửa bài học này")
    
    if tieu_de_muc:
        lesson.tieu_de_muc = tieu_de_muc
    if noi_dung is not None:
        lesson.noi_dung = noi_dung
    
    # Xử lý upload video
    final_video_path = video_path
    if video_file:
        # Lưu file video
        file_ext = os.path.splitext(video_file.filename)[1]
        allowed_extensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
        if file_ext.lower() not in allowed_extensions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Chỉ chấp nhận file video: {', '.join(allowed_extensions)}")
        
        filename = f"lesson_{lesson_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            content = video_file.file.read()
            buffer.write(content)
        
        final_video_path = f"/static/uploads/videos/{filename}"
    
    if final_video_path is not None:
        lesson.video_path = final_video_path
    
    # Xử lý upload PDF
    if tai_lieu_pdf_file:
        file_ext = os.path.splitext(tai_lieu_pdf_file.filename)[1]
        if file_ext.lower() != '.pdf':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ chấp nhận file PDF")
        
        filename = f"lesson_{lesson_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        file_path = os.path.join(PDF_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            content = tai_lieu_pdf_file.file.read()
            buffer.write(content)
        
        lesson.tai_lieu_pdf = f"/static/uploads/pdfs/{filename}"
    
    # Xử lý links
    if tai_lieu_links is not None:
        try:
            lesson.tai_lieu_links = json.loads(tai_lieu_links) if tai_lieu_links else []
        except json.JSONDecodeError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="tai_lieu_links phải là JSON hợp lệ")
    
    # Xử lý resources
    if resources is not None:
        try:
            lesson.resources = json.loads(resources) if resources else []
        except json.JSONDecodeError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="resources phải là JSON hợp lệ")
    
    db.commit()
    db.refresh(lesson)
    return lesson


@router.get("/lessons/{lesson_id}", response_model=ContentOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(CourseContent).filter(CourseContent.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bài học không tồn tại")
    return lesson

