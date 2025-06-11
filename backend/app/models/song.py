import datetime
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class Song(Base):
    __tablename__ = "songs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    lyrics: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    author_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

    author = relationship("User", back_populates="songs_created")
    songs_chords = relationship("SongChord", back_populates="song")


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

