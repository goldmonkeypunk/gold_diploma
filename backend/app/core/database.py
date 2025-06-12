from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

# ───── SQLAlchemy core setup ────────────────────────────────────────────────────
DATABASE_URL = (
    f"postgresql+psycopg2://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ───── helper for FastAPI lifespan / startup ───────────────────────────────────
def init_db() -> None:
    """
    Импортируем модели → создаём таблицы, если их нет.
    Вызывать из ``app/main.py`` в событии ``startup``.
    """
    from app import models  # noqa: WPS433  (локальный импорт, чтобы избежать циклов)

    Base.metadata.create_all(bind=engine)
