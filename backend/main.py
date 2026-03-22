"""Chronous Health API entry point."""
from fastapi import FastAPI

app = FastAPI(title="Chronous Health API")


@app.get("/health")
def health():
    return {"status": "ok"}
