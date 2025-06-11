from fastapi import APIRouter, HTTPException, status, Depends, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, constr
from datetime import timedelta
import re

from app.core.database import get_db
from app.models import User, UserRole
from app.core.security import (
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


def _validate_password(pwd: str) -> None:
    if (
        not re.search(r"[a-z]", pwd)
        or not re.search(r"[A-Z]", pwd)
        or not re.search(r"\d", pwd)
    ):
        raise HTTPException(400, "Пароль має містити літери різного регістру та цифру")


@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    _validate_password(data.password)
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(400, "Ім’я зайнято")
    user = User(
        username=data.username,
        hashed_password=hash_password(data.password),
        role=data.role or UserRole.USER,
    )
    db.add(user)
    db.commit()
    return {"msg": "Користувача створено"}


class LoginIn(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(400, "Невірні дані")
    token = create_access_token(
        {"sub": user.username, "role": user.role.value},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}
