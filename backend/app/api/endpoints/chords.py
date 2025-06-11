from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, UserChord, Chord
from app.api.endpoints.auth import get_current_user

router = APIRouter(prefix="/chords", tags=["chords-save"])


@router.post("/{chord_id}/save")
def save_chord(
    chord_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chord = db.query(Chord).filter(Chord.id == chord_id).first()
    if not chord:
        raise HTTPException(404, "Не знайдено")

    if db.query(UserChord).filter(
        UserChord.user_id == user.id, UserChord.chord_id == chord_id
    ).first():
        raise HTTPException(400, "Вже додано")

    db.add(UserChord(user_id=user.id, chord_id=chord_id))
    db.commit()
    return {"msg": "Додано"}


@router.delete("/{chord_id}/save")
def unsave_chord(
    chord_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = db.query(UserChord).filter(
        UserChord.user_id == user.id, UserChord.chord_id == chord_id
    ).first()
    if not link:
        raise HTTPException(404, "Не додано")
    db.delete(link)
    db.commit()
    return {"msg": "Прибрано"}


@router.get("/me/saved")
def my_saved_chords(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    links = db.query(UserChord).filter(UserChord.user_id == user.id).all()
    ids = [ln.chord_id for ln in links]
    chords = db.query(Chord).filter(Chord.id.in_(ids)).all()
    return [{"id": c.id, "name": c.name} for c in chords]
