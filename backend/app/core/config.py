from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "VendorBridge Procurement ERP"
    
    # Database
    # Default URL is set to a placeholder, but can be overridden in the .env file.
    # Note: For SQLite local testing, "sqlite:///./test.db" can be used.
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/vendorbridge"
    
    # Security
    # In production, this MUST be a strong, randomly generated key.
    SECRET_KEY: str = "8af39a03975ef7c3f3fae83dae91d8e100f72782b8813a45c381c81ef40d421a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # SMTP Settings
    SMTP_SERVER: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "noreply@vendorbridge.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
