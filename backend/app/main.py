from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.core.config import settings
from app.api import api_router
from app.db.database import create_tables


def create_app() -> FastAPI:
    app = FastAPI(
        title="EduNexus API",
        description="""
# EduNexus — Building the Future of Learning Systems 🎓

A comprehensive **Course Management API** that powers the EduNexus learning platform.

## Features
- 🔐 **JWT Authentication** — Secure login for admins and students
- 👤 **User Management** — Register, login, profile management
- 📚 **Course Management** — Full CRUD for courses, modules, and lessons
- 🎯 **Enrollment System** — Enroll in courses and track progress
- 🛡️ **Role-based Access** — Admin and student roles
- 📊 **Dashboard Stats** — Platform-wide analytics

## Authentication
Use the **Authorize** button (🔒) above to authenticate. Login at `/api/v1/auth/login/form` first.

> **Default Admin:** `admin@edunexus.com` / `Admin@123456`
        """,
        version=settings.APP_VERSION,
        contact={
            "name": "EduNexus Support",
            "email": "support@edunexus.com",
        },
        license_info={"name": "MIT"},
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(api_router)

    @app.get("/", tags=["Root"])
    def root():
        return {
            "app": settings.APP_NAME,
            "slogan": "Building the Future of Learning Systems",
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
        }

    @app.get("/health", tags=["Root"])
    def health():
        return {"status": "healthy", "app": settings.APP_NAME}

    return app


app = create_app()


@app.on_event("startup")
async def startup_event():
    """Create tables and seed initial admin on startup."""
    create_tables()
    _seed_admin()


def _seed_admin():
    from app.db.database import SessionLocal
    from app.models.user import User
    from app.core.security import get_password_hash

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                full_name=settings.FIRST_ADMIN_NAME,
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                is_admin=True,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin created: {settings.FIRST_ADMIN_EMAIL}")
        else:
            print(f"ℹ️  Admin already exists: {settings.FIRST_ADMIN_EMAIL}")
    finally:
        db.close()
