from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from .core.config import settings
from .db.base import Base
from .db.session import engine
from .api.routes import auth, users, courses, content, progress, discussions, certificates, enrollments, assignments, quiz, stats, reviews

# Import models to register metadata with Base
from .models import user, course, course_content  # noqa: F401
from .models import progress as progress_model  # noqa: F401
from .models import discussion  # noqa: F401
from .models import certificate  # noqa: F401
from .models import enrollment  # noqa: F401
from .models import assignment  # noqa: F401
from .models import quiz as quiz_model  # noqa: F401
from .models import review  # noqa: F401


def create_app() -> FastAPI:
    # Khởi tạo schema (tạm thời; production nên dùng alembic)
    Base.metadata.create_all(bind=engine)

    app = FastAPI(title="E-Learning FastAPI")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins or ["*"],
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
