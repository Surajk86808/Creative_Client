from __future__ import annotations

import logging
import smtplib
import socket
import time
from datetime import datetime
from typing import Callable, TypeVar

import requests


T = TypeVar("T")
BACKOFF_SCHEDULE_SECONDS = (2, 5, 10)


def is_transient_error(exc: Exception) -> bool:
    if isinstance(exc, (requests.Timeout, requests.ConnectionError, socket.timeout, TimeoutError)):
        return True
    if isinstance(exc, smtplib.SMTPResponseException):
        return 400 <= int(exc.smtp_code) < 500
    if isinstance(exc, smtplib.SMTPServerDisconnected):
        return True
    return False


def retry_operation(
    operation_name: str,
    operation: Callable[[], T],
    logger: logging.Logger,
) -> T:
    last_exc: Exception | None = None
    for attempt, delay in enumerate(BACKOFF_SCHEDULE_SECONDS, start=1):
        try:
            return operation()
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            if not is_transient_error(exc):
                raise
            logger.warning(
                "[RETRYING] op=%s attempt=%s timestamp=%s error=%s",
                operation_name,
                attempt,
                datetime.utcnow().isoformat(),
                exc,
            )
            time.sleep(delay)
    if last_exc is not None:
        raise last_exc
