from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.db.database import Base, engine
from app.api.routes import auth, users, courses, enrollments, uploads
from app.api.routes import payments as payments_router
from app.models import user, course, enrollment, payment
from app.core.security import create_first_admin

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_first_admin()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Building the Future of Learning Systems",
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
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
app.include_router(payments_router.router, prefix="/api/v1", tags=["payments"])


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "slogan": "Building the Future of Learning Systems",
        "version": settings.APP_VERSION,
    }