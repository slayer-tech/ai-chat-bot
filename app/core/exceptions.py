"""Application custom exceptions."""


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str = "Application error", status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed") -> None:
        super().__init__(message, status_code=401)


class AuthorizationError(AppException):
    """Raised when user lacks permissions."""

    def __init__(self, message: str = "Forbidden") -> None:
        super().__init__(message, status_code=403)


class TenantBlockedError(AppException):
    """Raised when tenant is blocked or exceeded limits."""

    def __init__(self, message: str = "Tenant blocked or limit exceeded") -> None:
        super().__init__(message, status_code=403)


class ValidationError(AppException):
    """Raised on input validation failure."""

    def __init__(self, message: str = "Validation error") -> None:
        super().__init__(message, status_code=422)


class ExternalAPIError(AppException):
    """Raised when external API call fails (after retries if applicable)."""

    def __init__(
        self,
        message: str = "External API error",
        source: str = "external_api",
        status_code: int = 502,
    ) -> None:
        self.source = source
        super().__init__(message, status_code=status_code)
