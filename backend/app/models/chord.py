from typing import Optional, List
import json

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class Chord(Base):
    __tablename__ = "chords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    strings_json: Mapped[Optional[str]] = mapped_column(String(300))
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(300))
    audio_url: Mapped[Optional[str]] = mapped_column(String(300))
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

    created_by_user = relationship("User", back_populates="chords_created")
    songs = relationship("SongChord", back_populates="chord")

    # допоміжна властивість для зручності
    @property
    def strings(self) -> List[int]:
        return json.loads(self.strings_json or "[]")

