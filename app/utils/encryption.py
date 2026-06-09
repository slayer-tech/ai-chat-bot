"""Fernet-based PII encryption/decryption."""

from cryptography.fernet import Fernet

from app.core.config import settings

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.ENCRYPTION_KEY
        if not key:
            raise RuntimeError("ENCRYPTION_KEY is not configured")
        try:
            _fernet = Fernet(key.encode() if isinstance(key, str) else key)
        except Exception as exc:
            raise RuntimeError(f"ENCRYPTION_KEY is not a valid Fernet key: {exc}")
    return _fernet


def encrypt_value(value: str) -> str:
    """Encrypt a string and return base64 ciphertext."""
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a base64 ciphertext back to plaintext."""
    return _get_fernet().decrypt(ciphertext.encode()).decode()
