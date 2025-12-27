from pydantic import BaseModel, Field


class PGNIn(BaseModel):
    pgn: str = Field(..., min_length=1, description="PGN text pasted/typed by the user.")


class PlyAnalysis(BaseModel):
    """Schema for a single ply (half-move) analysis."""
    ply: int
    uci: str
    san: str
    eval: dict
    bestMove: str | None
    bestReply: str | None
    bestEval: dict | None
    centipawnLoss: int
    grade: str
    reason: str | None = Field(None, description="Human-readable explanation for poor moves")


class AnalysisResponse(BaseModel):
    """Schema for PGN analysis response."""
    headers: dict
    depth: int
    stockfishPath: str
    finalFen: str
    finalEval: dict
    plies: list[PlyAnalysis]

