from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.middleware import RequestContextMiddleware

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)
app.add_middleware(RequestContextMiddleware)
app.include_router(api_router, prefix=settings.api_v1_prefix)
