from fastapi import APIRouter, Depends, HTTPException, status, Body, Path
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, UserRole
from app.api.endpoints.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[dict])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user),
):
    if admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Недостатньо прав")
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role.value,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.put("/{user_id}/role", status_code=200)
def set_role(
    user_id: int = Path(..., gt=0),
    new_role: UserRole = Body(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user),
):
    if admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Недостатньо прав")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    user.role = new_role
    db.commit()
    return {"msg": "Роль змінено", "user_id": user.id, "new_role": user.role.value}
