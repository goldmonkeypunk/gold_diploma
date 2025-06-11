from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class UserChord(Base):
    __tablename__ = "user_chords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    chord_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("chords.id", ondelete="CASCADE"), index=True
    )

    user = relationship("User", back_populates="saved_chords")
    chord = relationship("Chord")

    __table_args__ = (UniqueConstraint("user_id", "chord_id", name="uq_user_chord"),)
