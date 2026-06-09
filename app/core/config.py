"""Application settings via Pydantic v2."""

from typing import Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "ai-chat-bot"
    DEBUG: bool = False
    ENV: str = "production"
    TIMEZONE: str = "Europe/Moscow"
    FRONTEND_URL: str = ""

    # Database
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "ai_chat_bot"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    DATABASE_URL: str = ""

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Encryption
    ENCRYPTION_KEY: str = ""

    # Groq (temporary, will be replaced by YandexGPT 5.1 Pro)
    GROQ_API_KEY: str = ""

    # Wazzup (API keys are per-tenant in dashboard settings)
    WAZZUP_BASE_URL: str = "https://api.wazzup24.com/v3"

    # Yandex SpeechKit
    YANDEX_SPEECHKIT_API_KEY: str = ""
    YANDEX_SPEECHKIT_FOLDER_ID: str = ""
    YANDEX_SPEECHKIT_BASE_URL: str = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize"

    # CRM
    AMOCRM_BASE_URL: str = ""
    AMOCRM_ACCESS_TOKEN: str = ""
    BITRIX24_WEBHOOK_URL: str = ""
    CRM_WEBHOOK_SECRET: str = ""

    # Rate limits
    RATE_LIMIT_IP_PER_MINUTE: int = 100
    RATE_LIMIT_TENANT_PER_MINUTE: int = 1000

    # Celery
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    # Followup
    FOLLOWUP_DEFAULT_RATE_LIMIT: str = "1/4h"

    # Superadmin auto-seed (leave empty to skip)
    SUPERADMIN_EMAIL: str = ""
    SUPERADMIN_PASSWORD: str = ""

    @model_validator(mode="after")
    def validate_secrets(self):
        if self.ENV == "production":
            if not self.JWT_SECRET or len(self.JWT_SECRET) < 32:
                raise ValueError("JWT_SECRET must be at least 32 characters in production")
            if not self.DATABASE_URL:
                raise ValueError("DATABASE_URL is required in production")
            if not self.POSTGRES_PASSWORD:
                raise ValueError("POSTGRES_PASSWORD is required in production")
            if self.ENCRYPTION_KEY:
                from cryptography.fernet import Fernet
                try:
                    Fernet(self.ENCRYPTION_KEY.encode())
                except Exception as exc:
                    raise ValueError(f"ENCRYPTION_KEY is not a valid Fernet key: {exc}")
        return self

    @property
    def sync_database_url(self) -> str:
        if not self.DATABASE_URL:
            return ""
        return self.DATABASE_URL.replace("+asyncpg", "")


settings = Settings()
