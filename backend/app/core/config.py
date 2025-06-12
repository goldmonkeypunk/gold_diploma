from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # ───── database ──────────────────────────────────────────────────────────────
    db_user: str = Field(env="DB_USER")
    db_password: str = Field(env="DB_PASSWORD")
    db_host: str = Field(default="db", env="DB_HOST")
    db_port: int = Field(default=5432, env="DB_PORT")
    db_name: str = Field(default="chords_db", env="DB_NAME")

    # ───── security ──────────────────────────────────────────────────────────────
    secret_key: str = Field(env="SECRET_KEY")
    algorithm: str = Field(default="HS256", env="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
