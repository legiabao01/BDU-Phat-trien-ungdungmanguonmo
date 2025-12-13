from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import StreamingResponse, Response
import os
from pathlib import Path
from typing import Optional

router = APIRouter()

# Thư mục chứa video
VIDEO_DIR = Path("static/uploads/videos")


@router.get("/video/{filename:path}")
async def stream_video(filename: str, request: Request):
    """
    Stream video với hỗ trợ HTTP Range requests (206 Partial Content)
    Cho phép seek, pause/resume, và tối ưu bandwidth
    """
    file_path = VIDEO_DIR / filename
    
    # Kiểm tra file tồn tại
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video không tồn tại"
        )
    
    # Lấy file size
    file_size = file_path.stat().st_size
    
    # Lấy Range header từ request
    range_header = request.headers.get("range")
    
    if not range_header:
        # Nếu không có Range header, trả về toàn bộ file
        return StreamingResponse(
            open(file_path, "rb"),
            media_type="video/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(file_size),
                "Content-Type": "video/mp4",
            }
        )
    
    # Parse Range header (ví dụ: "bytes=0-1023" hoặc "bytes=1024-")
    try:
        byte_start = 0
        byte_end = file_size - 1
        
        if range_header.startswith("bytes="):
            ranges = range_header.replace("bytes=", "").split("-")
            if ranges[0]:
                byte_start = int(ranges[0])
            if ranges[1]:
                byte_end = int(ranges[1])
            else:
                byte_end = file_size - 1
        
        # Đảm bảo range hợp lệ
        if byte_start >= file_size or byte_end >= file_size or byte_start > byte_end:
            raise HTTPException(
                status_code=status.HTTP_416_RANGE_NOT_SATISFIABLE,
                detail="Range không hợp lệ",
                headers={
                    "Content-Range": f"bytes */{file_size}",
                }
            )
        
        content_length = byte_end - byte_start + 1
        
        # Tạo generator để đọc file theo chunk
        def generate():
            with open(file_path, "rb") as f:
                f.seek(byte_start)
                remaining = content_length
                chunk_size = 8192  # 8KB chunks
                
                while remaining > 0:
                    chunk = f.read(min(chunk_size, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk
        
        # Trả về 206 Partial Content
        return StreamingResponse(
            generate(),
            status_code=status.HTTP_206_PARTIAL_CONTENT,
            media_type="video/mp4",
            headers={
                "Content-Range": f"bytes {byte_start}-{byte_end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": "video/mp4",
                "Cache-Control": "public, max-age=3600",  # Cache 1 giờ
            }
        )
    
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Range header không hợp lệ"
        )


@router.head("/video/{filename:path}")
async def video_head(filename: str):
    """
    HEAD request để lấy metadata video mà không tải toàn bộ file
    """
    file_path = VIDEO_DIR / filename
    
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video không tồn tại"
        )
    
    file_size = file_path.stat().st_size
    
    return Response(
        status_code=status.HTTP_200_OK,
        headers={
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
            "Cache-Control": "public, max-age=3600",
        }
    )

