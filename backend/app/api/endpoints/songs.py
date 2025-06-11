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
from app.models import (
    Song,
    SongChord,
    Chord,
    User,
    UserRole,
    Genre,
    UserSong,
)
from app.api.endpoints.auth import get_current_user

router = APIRouter(prefix="/songs", tags=["songs"])

STATIC_DIR = Path(__file__).resolve().parents[3] / "static" / "songs"
STATIC_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", status_code=201)
def create_song(
    title: str = Body(...),
    lyrics: Optional[str] = Body(None),
    genre: Optional[Genre] = Body(Genre.OTHER),
    chord_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Тільки адміністратор може додавати пісні")

    if db.query(Song).filter(Song.title == title).first():
        raise HTTPException(400, "Пісня з такою назвою вже існує")

    song = Song(title=title, lyrics=lyrics, genre=genre, author_id=user.id)
    db.add(song)
    db.commit()
    db.refresh(song)

    chords = db.query(Chord).filter(Chord.id.in_(chord_ids)).all()
    if len(chords) != len(chord_ids):
        raise HTTPException(404, "Не всі акорди знайдено")

    for c in chords:
        link = SongChord(song_id=song.id, chord_id=c.id)
        db.add(link)
    db.commit()
    return {"id": song.id, "title": song.title}


@router.get("")
def list_songs(
    search: Optional[str] = Query(None),
    genre: Optional[Genre] = Query(None),
    chord_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Song)
    if search:
        q = q.filter(Song.title.ilike(f"%{search}%"))
    if genre:
        q = q.filter(Song.genre == genre)
    if chord_id:
        song_ids = (
            db.query(SongChord.song_id)
            .filter(SongChord.chord_id == chord_id)
            .subquery()
        )
        q = q.filter(Song.id.in_(song_ids))
    return [
        {"id": s.id, "title": s.title, "genre": s.genre.value if s.genre else None}
        for s in q.all()
    ]


@router.get("/{song_id}")
def song_details(
    song_id: int = FPath(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    chords = (
        db.query(Chord)
        .join(SongChord, SongChord.chord_id == Chord.id)
        .filter(SongChord.song_id == song.id)
        .all()
    )
    return {
        "id": song.id,
        "title": song.title,
        "lyrics": song.lyrics,
        "genre": song.genre.value if song.genre else None,
        "sheet_url": song.sheet_url,
        "audio_url": song.audio_url,
        "chords": [{"id": c.id, "name": c.name} for c in chords],
    }


@router.delete("/{song_id}")
def delete_song(
    song_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")
    db.delete(song)
    db.commit()
    return {"msg": "Видалено"}


@router.post("/{song_id}/upload-sheet")
def upload_sheet(
    song_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    ext = Path(file.filename).suffix.lower()
    if ext not in {".png", ".jpg", ".jpeg", ".pdf"}:
        raise HTTPException(400, "Допустимі .png .jpg .jpeg .pdf")
    dst = STATIC_DIR / f"{song_id}_sheet{ext}"
    dst.write_bytes(file.file.read())
    song.sheet_url = f"/static/songs/{dst.name}"
    db.commit()
    return {"sheet_url": song.sheet_url}


@router.post("/{song_id}/upload-audio")
def upload_audio(
    song_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(403, "Недостатньо прав")
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(404, "Не знайдено")
    ext = Path(file.filename).suffix.lower()
    if ext not in {".mp3", ".wav", ".ogg"}:
        raise HTTPException(400, "Допустимі .mp3 .wav .ogg")
    dst = STATIC_DIR / f"{song_id}_audio{ext}"
    dst.write_bytes(file.file.read())
    song.audio_url = f"/static/songs/{dst.name}"
    db.commit()
    return {"audio_url": song.audio_url}


@router.post("/{song_id}/save")
def save_song(
    song_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if db.query(UserSong).filter(
        UserSong.user_id == user.id, UserSong.song_id == song_id
    ).first():
        raise HTTPException(400, "Вже додано")
    db.add(UserSong(user_id=user.id, song_id=song_id))
    db.commit()
    return {"msg": "Додано до збережених"}


@router.delete("/{song_id}/save")
def unsave_song(
    song_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = db.query(UserSong).filter(
        UserSong.user_id == user.id, UserSong.song_id == song_id
    ).first()
    if not link:
        raise HTTPException(404, "Не збережено")
    db.delete(link)
    db.commit()
    return {"msg": "Прибрано з обраного"}


@router.get("/me/saved")
def my_saved_songs(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    links = db.query(UserSong).filter(UserSong.user_id == user.id).all()
    ids = [ln.song_id for ln in links]
    songs = db.query(Song).filter(Song.id.in_(ids)).all()
    return [{"id": s.id, "title": s.title} for s in songs]
