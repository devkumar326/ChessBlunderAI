from __future__ import annotations

import io
import shutil
from typing import Any

import chess
import chess.engine
import chess.pgn

from app.core.config import settings


def _resolve_stockfish_path() -> str:
    # Prefer explicit env/config path
    if settings.stockfish_path:
        return settings.stockfish_path

    # Try PATH
    which = shutil.which("stockfish")
    if which:
        return which

    # Common Debian/Ubuntu apt install location
    return "/usr/games/stockfish"


def _score_to_json(score: chess.engine.PovScore) -> dict[str, Any]:
    """
    Convert a python-chess score to JSON-friendly shape.
    Always from White's perspective.
    """
    mate = score.mate()
    if mate is not None:
        return {"type": "mate", "value": mate}

    cp = score.score()
    # score() can be None for some edge cases; guard just in case.
    return {"type": "cp", "value": cp if cp is not None else 0}


def analyze_pgn(
    pgn_text: str,
    *,
    depth: int | None = None,
    max_plies: int | None = None,
) -> dict[str, Any]:
    """
    Analyze a PGN using Stockfish and return basic per-ply evaluations.

    - depth: Stockfish search depth (default: settings.stockfish_depth)
    - max_plies: optionally limit number of half-moves analyzed (useful for very long games)
    """
    depth = depth or settings.stockfish_depth

    game = chess.pgn.read_game(io.StringIO(pgn_text))
    if game is None:
        raise ValueError("Could not parse PGN (no game found).")

    board = game.board()
    stockfish_path = _resolve_stockfish_path()

    plies: list[dict[str, Any]] = []

    # NOTE: This opens Stockfish per-request. For higher throughput, move this to
    # app startup/shutdown and reuse a single engine instance.
    with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:
        for ply_idx, move in enumerate(game.mainline_moves(), start=1):
            san = board.san(move)
            board.push(move)

            info = engine.analyse(board, chess.engine.Limit(depth=depth))

            pov = info["score"].pov(chess.WHITE)
            pv = info.get("pv") or []
            best_move = pv[0].uci() if pv else None

            plies.append(
                {
                    "ply": ply_idx,
                    "uci": move.uci(),
                    "san": san,
                    "eval": _score_to_json(pov),
                    "bestMove": best_move,
                }
            )

            if max_plies is not None and ply_idx >= max_plies:
                break

        final_info = engine.analyse(board, chess.engine.Limit(depth=depth))
        final_eval = _score_to_json(final_info["score"].pov(chess.WHITE))

    headers = dict(game.headers) if game.headers else {}
    return {
        "headers": headers,
        "depth": depth,
        "stockfishPath": stockfish_path,
        "finalFen": board.fen(),
        "finalEval": final_eval,
        "plies": plies,
    }


