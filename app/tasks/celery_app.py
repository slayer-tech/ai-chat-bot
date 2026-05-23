"""Celery app configuration."""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "ai_chat_bot",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.followup"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone=settings.TIMEZONE,
    enable_utc=True,
    beat_schedule={
        "process-followups": {
            "task": "app.tasks.followup.process_followups",
            "schedule": 60.0,
        },
        "reset-monthly-messages": {
            "task": "app.tasks.followup.reset_monthly_messages",
            "schedule": 86400.0,
        },
    },
)
