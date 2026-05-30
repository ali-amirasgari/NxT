from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="NxT AI Service", version="0.1.0")


class HealthResponse(BaseModel):
    status: str
    service: str


@app.get("/", response_model=HealthResponse)
async def root() -> HealthResponse:
    return HealthResponse(status="ok", service="ai-service")


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="ai-service")
