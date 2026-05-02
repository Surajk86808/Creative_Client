import os

MODEL_CONFIG = {
    "analysis": os.getenv("NVIDIA_PRIMARY_MODEL"),
    "fallback": os.getenv("NVIDIA_FALLBACK_MODEL"),
    "email": os.getenv("NVIDIA_EMAIL_MODEL"),
    "safety": os.getenv("NVIDIA_LLAMA_GUARD_MODEL"),
    "website": os.getenv("NVIDIA_WEBSITE_MODEL"),
    "pii": os.getenv("NVIDIA_PII_MODEL"),
}