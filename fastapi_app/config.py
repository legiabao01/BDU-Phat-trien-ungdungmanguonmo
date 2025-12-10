from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "Online Learning API"
    env: str = Field("development", env="ENV")
    db_url: str = Field(..., env="DATABASE_URL")  # postgres://user:pass@host:port/db
    jwt_secret: str = Field(..., env="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env.fastapi"


settings = Settings()

