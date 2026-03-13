from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import Base, engine
from app.api.routes import auth, users, courses, enrollments, uploads, payments
from app.models import user, course, enrollment, payment
from app.core.security import create_first_admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Building the Future of Learning Systems"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(courses.router, prefix="/api/v1", tags=["courses"])
app.include_router(enrollments.router, prefix="/api/v1", tags=["enrollments"])
app.include_router(uploads.router, prefix="/api/v1", tags=["uploads"])
app.include_router(payments.router, prefix="/api/v1", tags=["payments"])

@app.on_event("startup")
async def startup_event():
    create_first_admin()

@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "slogan": "Building the Future of Learning Systems",
        "version": settings.APP_VERSION,
    }