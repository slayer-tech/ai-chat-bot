# Agent Instructions

## CRITICAL: Database Safety

**NEVER delete, stop, prune, or recreate the PostgreSQL Docker volume (`ai-chatbot_postgres_data`) or the `postgres` service without explicit user approval.**

- `docker-compose down -v` / `docker volume prune` / `docker system prune` on a live project **WILL WIPE ALL DATA**.
- Before any action that touches the database volume or container, **ALWAYS ASK** the user.
- If the database password/auth is broken, prefer fixing credentials or restoring from backup instead of recreating the volume.
- Exception: user explicitly orders deletion and confirms understanding of total data loss.

## Deployment Checklist

1. Ensure sufficient disk space without deleting DB volumes.
2. `git pull` → `docker-compose build` → `docker-compose up -d`.
3. Run `alembic upgrade head` only after confirming the app container is healthy.
4. Clear `__pycache__` after deploy.
5. Re-embed knowledge base if embeddings model/dimensions changed.
6. Flush Redis RAG cache when embeddings are regenerated.

## Backups

- Automated daily PostgreSQL dumps are configured on the server (see `/home/site/ai-chatbot/scripts/backup-db.sh`).
- Dumps older than 14 days are rotated automatically.
