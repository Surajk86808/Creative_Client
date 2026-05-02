from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from typing import Any

import httpx

from .model_registry import MODEL_REGISTRY


logger = logging.getLogger("ai.nvidia")


class NVIDIAClient:
    def __init__(self) -> None:
        self.base_url = os.getenv("NVIDIA_API_BASE", "https://integrate.api.nvidia.com/v1").rstrip("/")
        self.api_key = os.getenv("NVIDIA_API_KEY", "").strip()
        self.timeout = float(os.getenv("NVIDIA_TIMEOUT_SECONDS", "45"))
        self.max_retries = int(os.getenv("NVIDIA_MAX_RETRIES", "3"))
        self.min_interval_seconds = float(os.getenv("NVIDIA_RATE_LIMIT_SECONDS", "1.0"))
        self._lock = asyncio.Lock()
        self._last_call_ts = 0.0

    async def _rate_limit(self) -> None:
        async with self._lock:
            elapsed = time.monotonic() - self._last_call_ts
            if elapsed < self.min_interval_seconds:
                await asyncio.sleep(self.min_interval_seconds - elapsed)
            self._last_call_ts = time.monotonic()

    async def _post_chat(
        self,
        *,
        model: str,
        messages: list[dict[str, str]],
        temperature: float,
        max_tokens: int | None,
        task_name: str,
    ) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("Missing NVIDIA_API_KEY environment variable.")

        payload: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        last_error: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            await self._rate_limit()
            start = time.perf_counter()
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload,
                    )
                latency_ms = int((time.perf_counter() - start) * 1000)
                self._log_call(
                    task_name=task_name,
                    model=model,
                    latency_ms=latency_ms,
                    attempt=attempt,
                    status_code=response.status_code,
                )
                response.raise_for_status()
                return response.json()
            except Exception as exc:  # noqa: BLE001
                latency_ms = int((time.perf_counter() - start) * 1000)
                self._log_call(
                    task_name=task_name,
                    model=model,
                    latency_ms=latency_ms,
                    attempt=attempt,
                    error=str(exc),
                )
                last_error = exc
                if attempt < self.max_retries:
                    await asyncio.sleep(min(2**attempt, 5))
        raise RuntimeError(str(last_error) if last_error else "Unknown NVIDIA client error")

    async def invoke_json(
        self,
        *,
        task_name: str,
        capability: str,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int | None = None,
        allow_fallback: bool = True,
    ) -> dict[str, Any]:
        primary_model = MODEL_REGISTRY[capability]
        try:
            payload = await self._post_chat(
                model=primary_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                task_name=task_name,
            )
            return self._extract_json(payload)
        except Exception:
            if not allow_fallback or capability == "fallback":
                raise
            fallback_model = MODEL_REGISTRY["fallback"]
            payload = await self._post_chat(
                model=fallback_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                task_name=f"{task_name}.fallback",
            )
            return self._extract_json(payload)

    async def invoke_text(
        self,
        *,
        task_name: str,
        capability: str,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int | None = None,
        allow_fallback: bool = True,
    ) -> str:
        primary_model = MODEL_REGISTRY[capability]
        try:
            payload = await self._post_chat(
                model=primary_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                task_name=task_name,
            )
            return self._extract_text(payload)
        except Exception:
            if not allow_fallback or capability == "fallback":
                raise
            fallback_model = MODEL_REGISTRY["fallback"]
            payload = await self._post_chat(
                model=fallback_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                task_name=f"{task_name}.fallback",
            )
            return self._extract_text(payload)

    def invoke_json_sync(self, **kwargs: Any) -> dict[str, Any]:
        return asyncio.run(self.invoke_json(**kwargs))

    def invoke_text_sync(self, **kwargs: Any) -> str:
        return asyncio.run(self.invoke_text(**kwargs))

    @staticmethod
    def _extract_text(payload: dict[str, Any]) -> str:
        choices = payload.get("choices") or []
        if not choices:
            raise ValueError("Empty NVIDIA response")
        message = choices[0].get("message") or {}
        content = message.get("content") or ""
        return str(content).strip()

    def _extract_json(self, payload: dict[str, Any]) -> dict[str, Any]:
        text = self._extract_text(payload)
        if not text:
            raise ValueError("Empty JSON response")
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise ValueError("No JSON object found in NVIDIA response")
        parsed = json.loads(text[start : end + 1])
        if not isinstance(parsed, dict):
            raise ValueError("JSON response is not an object")
        return parsed

    @staticmethod
    def _log_call(
        *,
        task_name: str,
        model: str,
        latency_ms: int,
        attempt: int,
        status_code: int | None = None,
        error: str | None = None,
    ) -> None:
        payload: dict[str, Any] = {
            "event": "ai_call",
            "task": task_name,
            "model": model,
            "latency_ms": latency_ms,
            "attempt": attempt,
        }
        if status_code is not None:
            payload["status_code"] = status_code
        if error:
            payload["error"] = error
        logger.info(json.dumps(payload, ensure_ascii=False))
