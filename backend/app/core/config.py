from __future__ import annotations

import os

from pydantic import BaseModel


class Settings(BaseModel):
    """
    Centralized app settings.

    Keep this small for now; expand as the project grows.
    """

    # CORS: allow local dev servers by default
    cors_allow_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Stockfish
    # In Debian-based images (like python:slim + apt install stockfish) it's commonly at /usr/games/stockfish.
    stockfish_path: str | None = os.getenv("STOCKFISH_PATH")
    # Depth 12-14 is fast and accurate for blunder detection; 16+ is very slow for long games
    stockfish_depth: int = int(os.getenv("STOCKFISH_DEPTH", "12"))


settings = Settings()


