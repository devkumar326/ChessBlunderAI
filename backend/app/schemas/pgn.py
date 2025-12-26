from pydantic import BaseModel, Field


class PGNIn(BaseModel):
    pgn: str = Field(..., min_length=1, description="PGN text pasted/typed by the user.")


