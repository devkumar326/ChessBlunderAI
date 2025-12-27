import logging

from fastapi import APIRouter, HTTPException

from app.schemas.pgn import PGNIn
from app.services.analysis import analyze_pgn

router = APIRouter()
logger = logging.getLogger("chessblunder-api")


@router.post("/pgn")
def receive_pgn(payload: PGNIn):
    logger.info("Received PGN:\n%s", payload.pgn)
    try:
        logger.info("Analyzing PGN...")
        analysis = analyze_pgn(payload.pgn)
        logger.info("analysis successful: %s", analysis)
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


