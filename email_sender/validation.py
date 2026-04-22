from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


REQUIRED_KEYS = {"meta", "templates", "bucket_no", "categories", "scenarios"}
DEFAULT_SCENARIO = "no_website"


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


def _slugify(value: Any) -> str:
    text = re.sub(r"[^a-z0-9]+", "_", str(value or "").strip().lower()).strip("_")
    return text or "bucket"


def _bucket_key(entry: dict[str, Any], index: int) -> str:
    raw = entry.get("bucket_key") or entry.get("key")
    if raw:
        return _slugify(raw)

    bucket_no = str(entry.get("bucket_no") or "").strip()
    if bucket_no:
        return f"bucket_{_slugify(bucket_no)}"

    bucket_name = str(entry.get("bucket_name") or "").strip()
    if bucket_name:
        return _slugify(bucket_name)

    return f"bucket_{index}"


def _normalize_string_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _template_payload_to_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if not isinstance(value, dict):
        return ""

    subject = str(value.get("subject") or "").strip()
    body = str(value.get("body") or "").strip()
    parts: list[str] = []
    if subject:
        parts.append(f"Subject guidance: {subject}")
    if body:
        parts.append(f"Body guidance:\n{body}")
    return "\n\n".join(parts).strip()


def _normalize_category_bucket_payload(payload: dict[str, Any]) -> dict[str, Any]:
    if isinstance(payload.get("buckets"), list):
        normalized = {
            "meta": payload.get("meta", {}),
            "templates": payload.get("templates", {}),
            "bucket_no": {},
            "categories": {},
            "scenarios": {},
        }
        for index, bucket in enumerate(payload["buckets"], start=1):
            if not isinstance(bucket, dict):
                continue
            key = _bucket_key(bucket, index)
            normalized["bucket_no"][key] = str(bucket.get("bucket_no") or index)
            normalized["categories"][key] = _normalize_string_list(bucket.get("categories"))
            normalized["scenarios"][key] = str(
                bucket.get("default_scenario")
                or bucket.get("scenario")
                or DEFAULT_SCENARIO
            )
        return normalized

    normalized = dict(payload)
    normalized.setdefault("meta", {})
    normalized.setdefault("templates", {})
    normalized.setdefault("bucket_no", {})
    normalized.setdefault("categories", {})
    normalized.setdefault("scenarios", {})
    return normalized


def _normalize_bucket_template_payload(payload: dict[str, Any]) -> dict[str, Any]:
    if isinstance(payload.get("templates"), list):
        normalized = {
            "meta": payload.get("meta", {}),
            "templates": {},
            "bucket_no": {},
            "categories": {},
            "scenarios": payload.get("scenarios", {}) if isinstance(payload.get("scenarios"), dict) else {},
        }
        for index, bucket in enumerate(payload["templates"], start=1):
            if not isinstance(bucket, dict):
                continue
            key = _bucket_key(bucket, index)
            normalized["bucket_no"][key] = str(bucket.get("bucket_no") or index)
            normalized["categories"][key] = _normalize_string_list(bucket.get("categories"))
            scenario_map = bucket.get("scenarios", {})
            templates: dict[str, str] = {}
            if isinstance(scenario_map, dict):
                for scenario_name, scenario_payload in scenario_map.items():
                    text = _template_payload_to_text(scenario_payload)
                    if text:
                        templates[str(scenario_name)] = text
            direct_text = _template_payload_to_text(bucket.get("template"))
            if direct_text and "default" not in templates:
                templates["default"] = direct_text
            normalized["templates"][key] = templates
        return normalized

    normalized = dict(payload)
    normalized.setdefault("meta", {})
    normalized.setdefault("templates", {})
    normalized.setdefault("bucket_no", {})
    normalized.setdefault("categories", {})
    normalized.setdefault("scenarios", {})

    templates = normalized.get("templates", {})
    if isinstance(templates, dict):
        normalized_templates: dict[str, Any] = {}
        for bucket_key, bucket_value in templates.items():
            if isinstance(bucket_value, dict):
                scenario_templates: dict[str, str] = {}
                for scenario_name, scenario_payload in bucket_value.items():
                    if isinstance(scenario_payload, (str, dict)):
                        text = _template_payload_to_text(scenario_payload)
                        if text:
                            scenario_templates[str(scenario_name)] = text
                normalized_templates[str(bucket_key)] = scenario_templates
            else:
                text = _template_payload_to_text(bucket_value)
                normalized_templates[str(bucket_key)] = text if text else bucket_value
        normalized["templates"] = normalized_templates
    return normalized


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
    category_bucket = _normalize_category_bucket_payload(_load_json_dict(category_bucket_path))
    bucket_templates = _normalize_bucket_template_payload(_load_json_dict(bucket_template_path))

    _validate_required_keys(category_bucket_path, category_bucket)
    _validate_required_keys(bucket_template_path, bucket_templates)
    return category_bucket, bucket_templates
