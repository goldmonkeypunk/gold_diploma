import datetime
from enum import Enum
from typing import List

from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime, Enum as SqlEnum

from .base import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(200))
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), default=UserRole.USER)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    chords_created: Mapped[List["Chord"]] = relationship(
        "Chord", back_populates="created_by_user"
    )
    songs_created: Mapped[List["Song"]] = relationship(
        "Song", back_populates="author"
    )
    saved_songs: Mapped[List["UserSong"]] = relationship(
        "UserSong", back_populates="user"
    )
    saved_chords: Mapped[List["UserChord"]] = relationship(
        "UserChord", back_populates="user"
    )
