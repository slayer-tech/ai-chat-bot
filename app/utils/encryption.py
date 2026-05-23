"""Fernet-based PII encryption/decryption."""

from cryptography.fernet import Fernet

from app.core.config import settings

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.ENCRYPTION_KEY.encode()
        _fernet = Fernet(key)
    return _fernet


def encrypt_value(value: str) -> str:
    """Encrypt a string and return base64 ciphertext."""
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a base64 ciphertext back to plaintext."""
    return _get_fernet().decrypt(ciphertext.encode()).decode()
