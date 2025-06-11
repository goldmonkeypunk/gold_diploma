import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class UserSong(Base):
    __tablename__ = "user_songs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    song_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("songs.id", ondelete="CASCADE"), index=True
    )
    saved_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    user = relationship("User", back_populates="saved_songs")
    song = relationship("Song", back_populates="saved_by_users")

    __table_args__ = (UniqueConstraint("user_id", "song_id", name="uq_user_song"),)
