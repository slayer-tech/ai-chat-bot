# SaaS AI Chat Bot

Мультитенантная SaaS-платформа AI-чат-бота с авто-дожимом для РФ.

## Стек

- Python 3.11+, FastAPI, uvicorn
- PostgreSQL 15+ (asyncpg, SQLAlchemy 2.0, Alembic, pgvector)
- Redis 7 (aioredis, Celery broker)
- Celery + Celery Beat
- HTTPX + tenacity (async retry)
- Pydantic v2, PyJWT + passlib
- pytest + pytest-asyncio
- Docker Compose

## Запуск

1. Скопируй `.env.example` в `.env` и заполни все ключи:
   - `OPENAI_API_KEY` — ключ из https://platform.openai.com/api-keys
   - `YANDEX_SPEECHKIT_API_KEY` и `YANDEX_SPEECHKIT_FOLDER_ID` из https://yandex.cloud/ru/
   - `WAZZUP_API_KEY` (каждый тенант может задать свой в Dashboard → Settings)
   - `ENCRYPTION_KEY` — сгенерируй через `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`

2. Подними окружение:
```bash
docker-compose up -d --build
```

3. Примени миграции:
```bash
docker-compose exec app alembic upgrade head
```

4. Создай супер-админа:
```bash
docker-compose exec app python -c "
import asyncio
from app.db.session import AsyncSessionLocal
from app.modules.tenants.service import create_admin
from app.schemas.tenant import TenantAdminCreate
async def main():
    async with AsyncSessionLocal() as db:
        await create_admin(db, TenantAdminCreate(email='super@admin.ru', password='SuperPass123!', role='superadmin', tenant_id=None))
asyncio.run(main())
"
```

## API

- Auth: `POST /api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`
- Superadmin: `GET /api/v1/super/tenants`, `GET|PUT /api/v1/super/tenants/{id}/settings`
- Tenant Admin: `GET /api/v1/admin/dashboard`, `GET|PUT /api/v1/admin/settings`
- Webhooks: `POST /webhook/wazzup`, `POST /webhook/crm`

## Wazzup Webhook

Настрой в личном кабинете Wazzup URL:
```
https://your-domain.com/webhook/wazzup
```

## Архитектура LLM

- **GPT-5.4-mini** — единственная модель для всех текстовых задач (диалоги, RAG, follow-up, prompt engineering, классификация).
- **text-embedding-3-small** — эмбеддинги (1536 dim) для семантического поиска по базе знаний.
- **Yandex SpeechKit** — распознавание голосовых сообщений.
- **CRM (amoCRM / Bitrix24)** — интеграция при handoff.

## Надёжность внешних API

- Любые ошибки OpenAI / Yandex SpeechKit повторяются 5 раз с интервалом 5 секунд.
- Если после ретраев API всё равно недоступен — диалог автоматически переводится на менеджера (handoff), а текст ошибки сохраняется в `dialogs.last_error_text`.

## Security Checklist

- [x] Все секреты в `.env`, никогда в коде
- [x] PII шифруется AES-256 (Fernet) перед хранением
- [x] PII токенизируется перед логированием/CRM; реальные значения хранятся в TokenVault (AES-256)
- [x] JWT access 15 мин, refresh 7 дней, blacklist в Redis
- [x] RBAC: superadmin / tenant_admin
- [x] Rate limiting (Redis sliding window) на IP и tenant
- [x] SQL-инъекции исключены (SQLAlchemy ORM)
- [x] Webhook signature проверка (Wazzup)
- [x] Изолированная Docker сеть, БД и Redis не exposed
- [x] Secure headers (HSTS, CSP, X-Frame-Options)
- [x] File upload: только PDF/TXT/DOCX, max 10MB
- [x] Audit logging для superadmin
- [x] HTTPS only (TLS 1.2+)

## Лицензия

Proprietary
