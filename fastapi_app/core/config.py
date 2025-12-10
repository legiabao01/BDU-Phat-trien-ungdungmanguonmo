from pathlib import Path
from typing import List
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl

env_path = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_alg: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7
    allowed_origins: List[AnyHttpUrl] = []

    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()

