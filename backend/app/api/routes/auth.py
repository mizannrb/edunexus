from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import (
    verify_password, create_access_token, get_password_hash, get_current_user
)
from app.models.user import User
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=user_data.full_name, email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        bio=user_data.bio, phone=user_data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token, summary="Login with JSON (for frontend)")
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": str(user.id)})
    user_response = UserResponse(
        id=user.id, full_name=user.full_name, email=user.email,
        bio=user.bio, phone=user.phone, is_active=user.is_active,
        is_admin=user.is_admin, avatar_url=user.avatar_url,
        created_at=user.created_at, enrollment_count=len(user.enrollments),
    )
    return Token(access_token=token, token_type="bearer", user=user_response)


@router.post(
    "/login/form",
    response_model=Token,
    summary="⬅️ Swagger Authorize button এর জন্য এটা ব্যবহার করুন"
)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(data={"sub": str(user.id)})
    user_response = UserResponse(
        id=user.id, full_name=user.full_name, email=user.email,
        bio=user.bio, phone=user.phone, is_active=user.is_active,
        is_admin=user.is_admin, avatar_url=user.avatar_url,
        created_at=user.created_at, enrollment_count=len(user.enrollments),
    )
    return Token(access_token=token, token_type="bearer", user=user_response)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
