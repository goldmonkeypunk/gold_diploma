from pathlib import Path
import json
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Body,
    Query,
    Path as FPath,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Chord, User, UserRole
from app.api.endpoints.auth import get_current_user

router = APIRouter(prefix="/chords", tags=["chords"])

STATIC_DIR = Path(__file__).resolve().parents[3] / "static" / "chords"
STATIC_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", status_code=201)
def create_chord(
    name: str = Body(...),
    strings: List[int] = Body(...),
    description: Optional[str] = Body(None),
    image_url: Optional[str] = Body(None),
    audio_url: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Тільки адміністратор може додавати акорди")
    if len(strings) != 6 or not all(-1 <= s <= 24 for s in strings):
        raise HTTPException(400, "Список strings має містити 6 чисел -1…24")
    if db.query(Chord).filter(Chord.name == name).first():
        raise HTTPException(400, "Акорд із такою назвою вже існує")

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
    search: Optional[str] = Query(None, alias="search"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Chord)
    if search:
        q = q.filter(Chord.name.ilike(f"%{search}%"))
    return [
        {
            "id": c.id,
            "name": c.name,
            "strings": json.loads(c.strings_json or "[]"),
            "image_url": c.image_url,
        }
        for c in q.all()
    ]


@router.get("/{chord_id}")
def chord_details(
    chord_id: int = FPath(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    chord = db.query(Chord).filter(Chord.id == chord_id).first()
    if not chord:
        raise HTTPException(404, "Не знайдено")
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


@router.post("/{chord_id}/upload-image")
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
        raise HTTPException(400, "Дозволені .png .jpg .jpeg .webp")

    dst = STATIC_DIR / f"{chord_id}{ext}"
    dst.write_bytes(file.file.read())
    chord.image_url = f"/static/chords/{dst.name}"
    db.commit()
    return {"image_url": chord.image_url}


@router.post("/{chord_id}/upload-audio")
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
        raise HTTPException(400, "Дозволені .mp3 .wav .ogg")

    dst = STATIC_DIR / f"{chord_id}{ext}"
    dst.write_bytes(file.file.read())
    chord.audio_url = f"/static/chords/{dst.name}"
    db.commit()
    return {"audio_url": chord.audio_url}
