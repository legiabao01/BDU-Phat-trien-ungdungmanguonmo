from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import json
import os

from .core.config import settings
from .db.base import Base
from .db.session import engine
from .api.routes import auth, users, courses, content, progress, discussions, certificates, enrollments, assignments, quiz, stats, reviews, notifications, code_execution, payments, wallet, admin_wallet, assignment_notifications, teacher_dashboard, messages, video_streaming

# Import models to register metadata with Base
from .models import user, course, course_content  # noqa: F401
from .models import progress as progress_model  # noqa: F401
from .models import discussion  # noqa: F401
from .models import certificate  # noqa: F401
from .models import enrollment  # noqa: F401
from .models import assignment  # noqa: F401
from .models import quiz as quiz_model  # noqa: F401
from .models import review  # noqa: F401
from .models import notification  # noqa: F401
from .models import payment  # noqa: F401
from .models import deposit  # noqa: F401
from .models import message  # noqa: F401


def create_app() -> FastAPI:
    # Khởi tạo schema (tạm thời; production nên dùng alembic)
    Base.metadata.create_all(bind=engine)

    # Custom JSONResponse để đảm bảo UTF-8 encoding
    class UTF8JSONResponse(JSONResponse):
        def render(self, content) -> bytes:
            return json.dumps(
                content,
                ensure_ascii=False,
                allow_nan=False,
                indent=None,
                separators=(",", ":"),
            ).encode("utf-8")
    
    app = FastAPI(
        title="E-Learning FastAPI",
        default_response_class=UTF8JSONResponse
    )

    # CORS: cố định danh sách origin hợp lệ; fallback gồm Vercel/Render
    # Luôn bật CORS cho các domain đã deploy (không phụ thuộc env để tránh sai định dạng)
    allowed_origins = [
        "https://bdu-phat-trien-ungdungmanguonmo.vercel.app",
        "https://bdu-phat-trien-ungdungmanguonmo-git-main-hangtr29s-projects.vercel.app",
        "https://bdu-phat-trien-ungdungmanguonmo-w1rc.onrender.com",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=r"https://.*",  # bắt tất cả https origin (để tránh miss)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth.router, prefix="/api")
    app.include_router(users.router, prefix="/api")
    app.include_router(courses.router, prefix="/api")
    app.include_router(content.router, prefix="/api")
    app.include_router(progress.router, prefix="/api")
    app.include_router(discussions.router, prefix="/api")
    app.include_router(certificates.router, prefix="/api")
    app.include_router(enrollments.router, prefix="/api")
    app.include_router(assignments.router, prefix="/api")
    app.include_router(quiz.router, prefix="/api")
    app.include_router(stats.router, prefix="/api")
    app.include_router(reviews.router, prefix="/api")
    app.include_router(notifications.router, prefix="/api")
    app.include_router(code_execution.router, prefix="/api/code")
    app.include_router(payments.router, prefix="/api/payments")
    app.include_router(wallet.router, prefix="/api/wallet")
    app.include_router(admin_wallet.router, prefix="/api/admin")
    app.include_router(assignment_notifications.router, prefix="/api")
    app.include_router(teacher_dashboard.router, prefix="/api")
    app.include_router(messages.router, prefix="/api")
    app.include_router(video_streaming.router, prefix="/api")

    # Mount static files để serve PDF, video, và các file upload
    static_dir = "static"
    if os.path.exists(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    # Scheduled task: Kiểm tra bài tập sắp hết hạn mỗi giờ
    @app.on_event("startup")
    def startup_event():
        import threading
        import time
        from .api.routes.assignment_notifications import check_and_notify_upcoming_deadlines
        from .db.session import SessionLocal
        
        def periodic_check():
            while True:
                time.sleep(3600)  # Chờ 1 giờ
                try:
                    db = SessionLocal()
                    check_and_notify_upcoming_deadlines(db)
                    db.close()
                except Exception as e:
                    print(f"Error in periodic deadline check: {e}")
        
        # Chạy task định kỳ trong background thread
        thread = threading.Thread(target=periodic_check, daemon=True)
        thread.start()

    # Exception handler để đảm bảo /api/courses luôn trả về array
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Nếu là endpoint /api/courses, luôn trả về array rỗng
        if request.url.path == "/api/courses":
            print(f"Exception in /api/courses: {exc}")
            import traceback
            traceback.print_exc()
            return JSONResponse(
                status_code=200,
                content=[]
            )
        # Các endpoint khác xử lý bình thường
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)}
        )
    
    @app.get("/health")
    def health():
        return {"status": "ok"}

    # Thêm Bearer security scheme vào OpenAPI để có ô dán token
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        openapi_schema = get_openapi(
            title=app.title,
            version="1.0.0",
            description="E-Learning FastAPI",
            routes=app.routes,
        )
        openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {})
        openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
        # Áp dụng mặc định cho các route (optional)
        openapi_schema.setdefault("security", [{"BearerAuth": []}])
        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi

    return app


app = create_app()
