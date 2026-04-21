from __future__ import annotations

import json
import random
import time
from collections import deque
from datetime import datetime, timedelta
from pathlib import Path


class RateLimiter:
    def __init__(self, max_per_hour: int, max_per_day: int, state_file: Path) -> None:
        self.max_per_hour = max_per_hour
        self.max_per_day = max_per_day
        self.state_file = state_file
        self.hourly: deque[datetime] = deque()
        self.daily: deque[datetime] = deque()
        self._load()

    def _load(self) -> None:
        if not self.state_file.exists():
            return
        try:
            payload = json.loads(self.state_file.read_text(encoding="utf-8"))
        except Exception:
            return
        if not isinstance(payload, dict):
            return
        for key, target in (("hourly", self.hourly), ("daily", self.daily)):
            values = payload.get(key, [])
            if isinstance(values, list):
                for item in values:
                    if isinstance(item, str):
                        try:
                            target.append(datetime.fromisoformat(item))
                        except ValueError:
                            continue

    def _save(self) -> None:
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "hourly": [dt.isoformat() for dt in self.hourly],
            "daily": [dt.isoformat() for dt in self.daily],
        }
        self.state_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def _prune(self, now: datetime) -> None:
        hour_ago = now - timedelta(hours=1)
        day_ago = now - timedelta(days=1)
        while self.hourly and self.hourly[0] < hour_ago:
            self.hourly.popleft()
        while self.daily and self.daily[0] < day_ago:
            self.daily.popleft()

    def can_send(self) -> tuple[bool, str]:
        now = datetime.utcnow()
        self._prune(now)
        if len(self.hourly) >= self.max_per_hour:
            return False, "Hourly cap reached"
        if len(self.daily) >= self.max_per_day:
            return False, "Daily cap reached"
        return True, ""

    def record_send(self) -> None:
        now = datetime.utcnow()
        self._prune(now)
        self.hourly.append(now)
        self.daily.append(now)
        self._save()

    @staticmethod
    def apply_random_delay() -> None:
        time.sleep(random.randint(45, 90))
