from __future__ import annotations

import json
from pathlib import Path
from typing import Any


REQUIRED_KEYS = {"meta", "templates", "bucket_no", "categories", "scenarios"}


class TemplateValidationError(RuntimeError):
    pass


def _load_json_dict(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise TemplateValidationError(f"Missing required file: {path}")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise TemplateValidationError(f"Invalid JSON in {path}: {exc}") from exc
    if not isinstance(payload, dict):
        raise TemplateValidationError(f"Expected JSON object in {path}")
    return payload


def _validate_required_keys(path: Path, payload: dict[str, Any]) -> None:
    missing = sorted(REQUIRED_KEYS - set(payload.keys()))
    if missing:
        raise TemplateValidationError(
            f"Missing required keys in {path}: {', '.join(missing)}"
        )


def validate_template_files(
    category_bucket_path: Path,
    bucket_template_path: Path,
) -> tuple[dict[str, Any], dict[str, Any]]:
    category_bucket = _load_json_dict(category_bucket_path)
    bucket_templates = _load_json_dict(bucket_template_path)

    _validate_required_keys(category_bucket_path, category_bucket)
    _validate_required_keys(bucket_template_path, bucket_templates)
    return category_bucket, bucket_templates
