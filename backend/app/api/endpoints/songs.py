from pathlib import Path
from typing import Optional, List
import json

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

from app.models.song import Song, SongChord
from app.models.chord import Chord
from app.models.user import User, UserRole
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user

router = APIRouter(prefix="/songs", tags=["songs"])

STATIC_DIR = Path(__file__).resolve().parents[3] / "static" / "songs"
STATIC_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", status_code=201)
def create_song(
    title: str = Body(...),
    lyrics: Optional[str] = Body(None),
    genre: Optional[str] = Body(None),
    chord_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Тільки адміністратор може додавати пісні")

    chords = db.query(Chord).filter(Chord.id.in_(chord_ids)).all()
    if len(chords) != len(chord_ids):
        raise HTTPException(404, detail="Деякі акорди не знайдено")

    song = Song(title=title, lyrics=lyrics, genre=genre, author_id=user.id)
    db.add(song)
    db.commit()
    for ch in chords:
        db.add(SongChord(song_id=song.id, chord_id=ch.id))
    db.commit()
    return {"id": song.id, "title": song.title}


@router.get("")
def list_songs(
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    chord_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Song)

    if search:
        query = query.filter(Song.title.ilike(f"%{search}%"))

    if genre:
        query = query.filter(Song.genre == genre)

    if chord_ids:
        query = query.join(SongChord).filter(SongChord.chord_id.in_(chord_ids)).distinct()

    return [
        {
            "id": s.id,
            "title": s.title,
            "genre": s.genre,
        }
        for s in query.all()
    ]


@router.get("/{song_id}")
def get_song(
    song_id: int = FPath(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    links = db.query(SongChord).filter(SongChord.song_id == song.id).all()
    chords = []
    for link in links:
        ch = db.query(Chord).filter(Chord.id == link.chord_id).first()
        if ch:
            chords.append({
                "id": ch.id,
                "name": ch.name,
                "strings": json.loads(ch.strings_json or "[]"),
                "image_url": ch.image_url,
                "audio_url": ch.audio_url,
            })
    return {
        "id": song.id,
        "title": song.title,
        "lyrics": song.lyrics,
        "genre": song.genre,
        "chords": chords,
    }


@router.delete("/{song_id}")
def delete_song(
    song_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Тільки адміністратор може видаляти")

    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    db.delete(song)
    db.commit()
    return {"msg": "Видалено"}


@router.post("/{song_id}/upload-image")
def upload_image(
    song_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(400, "Лише зображення дозволені")

    dst = STATIC_DIR / f"{song_id}_image{ext}"
    dst.write_bytes(file.file.read())

    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    song.image_url = f"/static/songs/{song_id}_image{ext}"
    db.commit()
    return {"image_url": song.image_url}


@router.post("/{song_id}/upload-audio")
def upload_audio(
    song_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".mp3", ".wav", ".ogg"}:
        raise HTTPException(400, "Лише аудіо дозволено")

    dst = STATIC_DIR / f"{song_id}_audio{ext}"
    dst.write_bytes(file.file.read())

    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    song.audio_url = f"/static/songs/{song_id}_audio{ext}"
    db.commit()
    return {"audio_url": song.audio_url}


@router.post("/{song_id}/save")
def save_song(
    song_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models.user import UserSong

    exists = db.query(UserSong).filter_by(user_id=user.id, song_id=song_id).first()
    if exists:
        raise HTTPException(400, "Вже збережено")

    db.add(UserSong(user_id=user.id, song_id=song_id))
    db.commit()
    return {"msg": "Додано у збережені"}


@router.delete("/{song_id}/save")
def unsave_song(
    song_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models.user import UserSong

    link = db.query(UserSong).filter_by(user_id=user.id, song_id=song_id).first()
    if not link:
        raise HTTPException(404, "Пісня не збережена")
    db.delete(link)
    db.commit()
    return {"msg": "Видалено з обраного"}


@router.get("/saved/me")
def get_saved_songs(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.models.user import UserSong

    links = db.query(UserSong).filter_by(user_id=user.id).all()
    result = []
    for link in links:
        song = db.query(Song).filter(Song.id == link.song_id).first()
        if song:
            result.append({
                "id": song.id,
                "title": song.title,
                "genre": song.genre,
            })
    return result

