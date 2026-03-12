from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.core.security import get_current_user, get_current_admin, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserResponse, UserListResponse, UserUpdate, UserAdminUpdate, PasswordChange

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/",
    response_model=List[UserListResponse],
    summary="List all users (Admin)",
    description="Get all registered users. Admin only."
)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_admin: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)
    return query.offset(skip).limit(limit).all()


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID (Admin)",
    description="Get a specific user's profile. Admin only."
)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put(
    "/me/profile",
    response_model=UserResponse,
    summary="Update own profile",
    description="Update the current user's profile information."
)
def update_my_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put(
    "/me/password",
    summary="Change password",
    description="Change your own password. Requires current password verification."
)
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user (Admin)",
    description="Admin can update any user's info, including admin status and active status."
)
def admin_update_user(
    user_id: int,
    update_data: UserAdminUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent admin from removing own admin rights
    if user.id == current_admin.id and update_data.is_admin is False:
        raise HTTPException(status_code=400, detail="Cannot remove your own admin rights")
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user (Admin)",
    description="Permanently delete a user. Admin only."
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()


@router.post(
    "/{user_id}/make-admin",
    response_model=UserResponse,
    summary="Grant admin role (Admin)",
    description="Grant admin privileges to a user."
)
def make_admin(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/{user_id}/revoke-admin",
    response_model=UserResponse,
    summary="Revoke admin role (Admin)",
    description="Remove admin privileges from a user."
)
def revoke_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot revoke your own admin rights")
    user.is_admin = False
    db.commit()
    db.refresh(user)
    return user
