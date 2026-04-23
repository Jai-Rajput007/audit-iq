import time
from collections import defaultdict, deque
from uuid import uuid4

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import get_settings


class RequestContextMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.settings = get_settings()
        self.window = 60
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid4())
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        bucket = self.requests[client_ip]
        while bucket and (now - bucket[0]) > self.window:
            bucket.popleft()
        if len(bucket) >= self.settings.rate_limit_per_minute:
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
        bucket.append(now)

        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        response.headers["X-Process-Time-Ms"] = str(int((time.time() - now) * 1000))
        return response
