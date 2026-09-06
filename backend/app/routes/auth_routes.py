from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, PasswordResetRequest, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user, require_role

router = APIRouter(prefix="/api/auth", tags=["Authentication"]) 

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Check duplicate login_id if provided
    if user_data.login_id:
        existing_login = db.query(User).filter(User.login_id == user_data.login_id).first()
        if existing_login:
            raise HTTPException(status_code=400, detail="Login Id is already taken")

    new_user = User(
        login_id=user_data.login_id,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role or "invoicing_user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Match either login_id or email
    user = db.query(User).filter(
        or_(User.email == login_data.login_id, User.login_id == login_data.login_id)
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid Login Id or Password")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.email == req.login_or_email, User.login_id == req.login_or_email)
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found with provided Login Id or Email")

    user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password reset successfully. You can now sign in with your new password."}

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).order_by(User.id.desc()).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_admin(user_data: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["admin"]))):
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already registered")

    if user_data.login_id:
        existing_login = db.query(User).filter(User.login_id == user_data.login_id).first()
        if existing_login:
            raise HTTPException(status_code=400, detail="Login Id is already taken")

    new_user = User(
        login_id=user_data.login_id,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
