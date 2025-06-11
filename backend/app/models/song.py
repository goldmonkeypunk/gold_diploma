import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy import (
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Enum as SqlEnum,
)

from .base import Base


class Genre(str, Enum):
    ROCK = "rock"
    POP = "pop"
    JAZZ = "jazz"
    CLASSIC = "classic"
    OTHER = "other"


class Song(Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    lyrics: Mapped[Optional[str]] = mapped_column(Text)
    genre: Mapped[Optional[Genre]] = mapped_column(SqlEnum(Genre), default=Genre.OTHER)
    sheet_url: Mapped[Optional[str]] = mapped_column(String(300))
    audio_url: Mapped[Optional[str]] = mapped_column(String(300))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    author = relationship("User", back_populates="songs_created")
    songs_chords = relationship("SongChord", back_populates="song")
    saved_by_users = relationship("UserSong", back_populates="song")


class SongChord(Base):
    __tablename__ = "song_chords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    song_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("songs.id", ondelete="CASCADE")
    )
    chord_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("chords.id", ondelete="CASCADE")
    )

    song = relationship("Song", back_populates="songs_chords")
    chord = relationship("Chord", back_populates="songs")

    __table_args__ = (UniqueConstraint("song_id", "chord_id", name="uq_song_chord"),)
