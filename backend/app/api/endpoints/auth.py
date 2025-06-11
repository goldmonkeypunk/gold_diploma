from fastapi import APIRouter, HTTPException, status, Depends, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, constr
from datetime import timedelta
import re

from database import get_db
from models import User, UserRole
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="", tags=["auth"])


class RegisterIn(BaseModel):
    username: constr(strip_whitespace=True, min_length=3, max_length=50)
    password: constr(strip_whitespace=True, min_length=8, max_length=128)
    role: UserRole | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


def _validate_password(password: str) -> None:
    if (
        not re.search(r"[a-z]", password)
        or not re.search(r"[A-Z]", password)
        or not re.search(r"\d", password)
        or len(password) < 8
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль має містити ≥ 8 символів, принаймні одну велику, малу літеру та цифру",
        )


@router.post("/register", status_code=200)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    _validate_password(data.password)

    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Ім’я зайнято")

    new_user = User(
        username=data.username,
        hashed_password=hash_password(data.password),
        role=data.role or UserRole.USER,
    )
    db.add(new_user)
    db.commit()
    return {"msg": "Користувача створено", "user_id": new_user.id, "role": new_user.role.value}


class LoginIn(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Невірне ім’я або пароль")

    token = create_access_token(
        {"sub": user.username, "role": user.role.value},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}

