from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/edunexus"
    SECRET_KEY: str = "edunexus-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    APP_NAME: str = "EduNexus"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    FIRST_ADMIN_EMAIL: str = "admin@edunexus.com"
    FIRST_ADMIN_PASSWORD: str = "Admin@123456"
    FIRST_ADMIN_NAME: str = "Super Admin"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
