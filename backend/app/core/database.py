import datetime
from typing import Optional

from pydantic import BaseSettings, Field, validator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

try:
    import alembic.config
    import alembic.command
except ImportError:
    alembic = None

from app.models import Base


class DBSettings(BaseSettings):
    db_dialect: str = Field(default="sqlite", env="DB_DIALECT")
    db_host: Optional[str] = Field(default=None, env="DB_HOST")
    db_port: Optional[int] = Field(default=None, env="DB_PORT")
    db_user: Optional[str] = Field(default=None, env="DB_USER")
    db_pass: Optional[str] = Field(default=None, env="DB_PASS")
    db_name: str = Field(default="app.db", env="DB_NAME")
    use_alembic: bool = Field(default=False, env="USE_ALEMBIC")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @validator("db_dialect")
    def validate_dialect(cls, v):
        if v not in ("sqlite", "postgresql", "mysql"):
            raise ValueError("Unsupported DB_DIALECT")
        return v


settings = DBSettings()

if settings.db_dialect == "sqlite":
    DATABASE_URL = f"sqlite:///{settings.db_name}"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}, echo=False
    )
else:
    if not (settings.db_host and settings.db_port and settings.db_user and settings.db_pass):
        raise ValueError("Missing database connection variables")

    if settings.db_dialect == "postgresql":
        DATABASE_URL = (
            f"postgresql://{settings.db_user}:{settings.db_pass}"
            f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
        )
    elif settings.db_dialect == "mysql":
        DATABASE_URL = (
            f"mysql+pymysql://{settings.db_user}:{settings.db_pass}"
            f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
        )
    else:
        raise NotImplementedError("Unsupported dialect")

    engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    if settings.use_alembic and alembic:
        apply_alembic()
    else:
        Base.metadata.create_all(bind=engine)


def apply_alembic() -> None:
    if not alembic:
        Base.metadata.create_all(bind=engine)
        return
    try:
        cfg = alembic.config.Config("alembic.ini")
        alembic.command.upgrade(cfg, "head")
    except Exception:
        Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def recreate_all():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        row = result.fetchone()
        if not row or row[0] != 1:
            raise RuntimeError("DB connection test failed")

