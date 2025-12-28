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


class LearningInsightsRequest(BaseModel):
    """Schema for requesting learning insights."""
    plies: list[dict]
    playerColor: str = Field(..., description="white or black - the color the player was playing")
    headers: dict | None = Field(None, description="Optional game metadata")


class ErrorCount(BaseModel):
    """Error statistics."""
    blunders: int
    mistakes: int
    inaccuracies: int


class LearningInsightsResponse(BaseModel):
    """Schema for learning insights response."""
    insights: str = Field(..., description="AI-generated learning insights")
    errorCount: ErrorCount
    playerColor: str
    error: str | None = Field(None, description="Error message if LLM call failed")

