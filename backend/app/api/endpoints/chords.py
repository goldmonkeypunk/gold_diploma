from pathlib import Path
import json
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Body,
    Query,
    Path as FPath,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.chord import Chord
from app.models.user import User, UserRole
from app.api.endpoints.auth import get_current_user

router = APIRouter(prefix="/chords", tags=["chords"])

STATIC_DIR = Path(__file__).resolve().parents[3] / "static" / "chords"
STATIC_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", status_code=201)
def create_chord(
    name: str = Body(..., embed=True),
    strings: List[int] = Body(..., embed=True),
    description: Optional[str] = Body(None, embed=True),
    image_url: Optional[str] = Body(None, embed=True),
    audio_url: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Тільки адміністратор може додавати акорди")

    if len(strings) != 6 or not all(-1 <= s <= 24 for s in strings):
        raise HTTPException(status_code=400, detail="Список strings має містити рівно 6 чисел у діапазоні -1…24")

    if db.query(Chord).filter(Chord.name == name).first():
        raise HTTPException(status_code=400, detail="Акорд із такою назвою вже існує")

    chord = Chord(
        name=name,
        strings_json=json.dumps(strings),
        description=description,
        image_url=image_url,
        audio_url=audio_url,
        created_by=user.id,
    )
    db.add(chord)
    db.commit()
    db.refresh(chord)
    return {"id": chord.id, "name": chord.name}


@router.get("")
def list_chords(
    q: Optional[str] = Query(None, alias="search"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Chord)
    if q:
        query = query.filter(Chord.name.ilike(f"%{q}%"))
    return [
        {
            "id": c.id,
            "name": c.name,
            "strings": json.loads(c.strings_json or "[]"),
            "image_url": c.image_url,
        }
        for c in query.all()
    ]


@router.get("/{chord_id}")
def chord_details(
    chord_id: int = FPath(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    chord = db.query(Chord).filter(Chord.id == chord_id).first()
    if not chord:
        raise HTTPException(status_code=404, detail="Не знайдено")
    return {
        "id": chord.id,
        "name": chord.name,
        "strings": json.loads(chord.strings_json or "[]"),
        "description": chord.description,
        "image_url": chord.image_url,
        "audio_url": chord.audio_url,
    }


@router.delete("/{chord_id}")
def delete_chord(
    chord_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    chord = db.query(Chord).filter(Chord.id == chord_id).first()
    if not chord:
        raise HTTPException(404, "Не знайдено")
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")
    db.delete(chord)
    db.commit()
    return {"msg": "Видалено"}


@router.post("/{chord_id}/upload-image", status_code=200)
def upload_image(
    chord_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")
    chord = db.query(Chord).filter(Chord.id == chord_id).first()
    if not chord:
        raise HTTPException(404, "Не знайдено")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(400, "Дозволені лише зображення")

    dst_path = STATIC_DIR / f"{chord_id}{ext}"
    dst_path.write_bytes(file.file.read())

    chord.image_url = f"/static/chords/{chord_id}{ext}"
    db.commit()
    return {"image_url": chord.image_url}


@router.post("/{chord_id}/upload-audio", status_code=200)
def upload_audio(
    chord_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")
    chord = db.query(Chord).filter(Chord.id == chord_id).first()
    if not chord:
        raise HTTPException(404, "Не знайдено")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".mp3", ".wav", ".ogg"}:
        raise HTTPException(400, "Дозволені лише аудіо")

    dst_path = STATIC_DIR / f"{chord_id}{ext}"
    dst_path.write_bytes(file.file.read())

    chord.audio_url = f"/static/chords/{chord_id}{ext}"
    db.commit()
    return {"audio_url": chord.audio_url}

