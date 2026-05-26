"""Application settings via Pydantic v2."""

from typing import Optional

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

    # Database
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "ai_chat_bot"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/ai_chat_bot"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    JWT_SECRET: str = "change_me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Encryption
    ENCRYPTION_KEY: str = ""

    # Groq (temporary, will be replaced by YandexGPT 5.1 Pro)
    GROQ_API_KEY: str = ""

    # Wazzup (base URL + public webhook URL — API keys are per-tenant in dashboard settings)
    WAZZUP_BASE_URL: str = "https://api.wazzup24.com/v3"
    WAZZUP_WEBHOOK_URL: str = ""  # e.g. https://kayleereed.org/webhook/wazzup

    # Yandex SpeechKit
    YANDEX_SPEECHKIT_API_KEY: str = ""
    YANDEX_SPEECHKIT_FOLDER_ID: str = ""
    YANDEX_SPEECHKIT_BASE_URL: str = "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize"

    # CRM
    AMOCRM_BASE_URL: str = ""
    AMOCRM_ACCESS_TOKEN: str = ""
    BITRIX24_WEBHOOK_URL: str = ""

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

    @property
    def sync_database_url(self) -> str:
        return self.DATABASE_URL.replace("+asyncpg", "")


settings = Settings()
