import logging

from fastapi import APIRouter, HTTPException

from app.schemas.pgn import LearningInsightsRequest, PGNIn
from app.services.analysis import analyze_pgn
from app.services.llm import generate_learning_insights

router = APIRouter()
logger = logging.getLogger("chessblunder-api")


@router.post("/pgn")
def receive_pgn(payload: PGNIn):
    logger.info("Received PGN:\n%s", payload.pgn)
    try:
        logger.info("Analyzing PGN...")
        analysis = analyze_pgn(payload.pgn)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except FileNotFoundError as e:
        # Typically means the Stockfish binary isn't present at the resolved path.
        raise HTTPException(
            status_code=500,
            detail="Stockfish engine not found. Set STOCKFISH_PATH or install stockfish.",
        ) from e
    except Exception as e:
        logger.exception("Stockfish analysis failed")
        raise HTTPException(status_code=500, detail="Stockfish analysis failed.") from e

    return {"ok": True, "analysis": analysis}


@router.post("/learning-insights")
def get_learning_insights(payload: LearningInsightsRequest):
    """
    Generate learning insights for a player's mistakes and blunders using AI.
    """
    logger.info("Generating learning insights for %s", payload.playerColor)
    try:
        insights = generate_learning_insights(
            plies=payload.plies,
            player_color=payload.playerColor,
            game_headers=payload.headers,
        )
        return {"ok": True, "data": insights}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Failed to generate learning insights")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate learning insights: {str(e)}"
        ) from e


