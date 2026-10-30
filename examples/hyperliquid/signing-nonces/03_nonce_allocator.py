"""Compare timestamp-only nonces with a locked monotonic allocator."""

import json
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Callable


FIXED_TIME_MS = 1_900_000_000_000
WORKERS = 6


@dataclass
class MonotonicNonceAllocator:
    clock_ms: Callable[[], int]
    _last: int = 0
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def next(self) -> int:
        with self._lock:
            now = self.clock_ms()
            self._last = max(now, self._last + 1)
            return self._last


def fixed_clock() -> int:
    return FIXED_TIME_MS


def run_workers(allocate: Callable[[], int]) -> list[int]:
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        return list(executor.map(lambda _: allocate(), range(WORKERS)))


unsafe = run_workers(fixed_clock)
allocator = MonotonicNonceAllocator(fixed_clock)
safe = run_workers(allocator.next)

print(
    json.dumps(
        {
            "unsafeTimestampOnly": unsafe,
            "unsafeUniqueCount": len(set(unsafe)),
            "monotonicAllocatorSorted": sorted(safe),
            "safeUniqueCount": len(set(safe)),
        },
        indent=2,
    )
)