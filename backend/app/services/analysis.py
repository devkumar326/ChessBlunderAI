from __future__ import annotations

import io
import shutil
from typing import Any

import chess
import chess.engine
import chess.pgn

from app.core.config import settings


def _normalize_pgn_text(pgn_text: str) -> str:
    """
    python-chess's PGN reader can stop early if movetext contains blank lines,
    especially when no headers are present. To make input robust for textarea
    PGNs, we:
    - preserve header lines (if present)
    - collapse ALL whitespace in movetext (including blank lines) into single spaces
    """
    text = pgn_text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text:
        return text

    # Detect if the input begins with PGN tags.
    if text.lstrip().startswith("["):
        lines = text.split("\n")
        header_lines: list[str] = []
        i = 0
        while i < len(lines) and lines[i].strip():
            header_lines.append(lines[i])
            i += 1

        # Skip blank lines between headers and movetext.
        while i < len(lines) and not lines[i].strip():
            i += 1

        movetext = " ".join(" ".join(lines[i:]).split())
        if header_lines:
            return "\n".join(header_lines) + "\n\n" + movetext
        return movetext

    # No headers: just normalize all whitespace.
    return " ".join(text.split())


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


def _pov_to_cp_like(score: chess.engine.PovScore) -> int:
    """
    Convert a python-chess PovScore to a single cp-like integer.
    Uses mate_score mapping so mate scores are comparable to cp.
    Always from the POV encoded in the score (we typically pass White POV).
    """
    val = score.score(mate_score=100_000)
    return int(val) if val is not None else 0


def _grade_from_centipawn_loss(loss: int, *, is_exact_best: bool) -> str:
    """
    Lichess-ish thresholds (cp loss from mover's perspective).
    """
    if is_exact_best or loss <= 10:
        return "Best"
    if loss <= 50:
        return "Excellent"
    if loss <= 100:
        return "Good"
    if loss <= 200:
        return "Inaccuracy"
    if loss <= 500:
        return "Mistake"
    return "Blunder"


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

    normalized_pgn = _normalize_pgn_text(pgn_text)
    game = chess.pgn.read_game(io.StringIO(normalized_pgn))
    if game is None:
        raise ValueError("Could not parse PGN (no game found).")

    board = game.board()
    stockfish_path = _resolve_stockfish_path()

    plies: list[dict[str, Any]] = []

    # NOTE: This opens Stockfish per-request. For higher throughput, move this to
    # app startup/shutdown and reuse a single engine instance.
    with chess.engine.SimpleEngine.popen_uci(stockfish_path) as engine:
        for ply_idx, move in enumerate(game.mainline_moves(), start=1):
            # Analyze BEFORE the move so we can know what the engine wanted instead.
            mover_is_white = board.turn == chess.WHITE

            info_before = engine.analyse(board, chess.engine.Limit(depth=depth))
            pv_before = info_before.get("pv") or []
            best_move_to_play = pv_before[0] if pv_before else None

            best_after_eval_json: dict[str, Any] | None = None
            best_after_cp_like_mover: int | None = None
            if best_move_to_play is not None:
                best_board = board.copy()
                best_board.push(best_move_to_play)
                info_best_after = engine.analyse(best_board, chess.engine.Limit(depth=depth))
                best_after_pov_white = info_best_after["score"].pov(chess.WHITE)
                best_after_eval_json = _score_to_json(best_after_pov_white)

                best_after_cp_like_white = _pov_to_cp_like(best_after_pov_white)
                best_after_cp_like_mover = (
                    best_after_cp_like_white if mover_is_white else -best_after_cp_like_white
                )

            # Apply player's move
            san = board.san(move)
            played_uci = move.uci()
            board.push(move)

            # Analyze AFTER the move (this is the eval you already returned)
            info_after = engine.analyse(board, chess.engine.Limit(depth=depth))
            played_after_pov_white = info_after["score"].pov(chess.WHITE)
            played_after_eval_json = _score_to_json(played_after_pov_white)

            played_after_cp_like_white = _pov_to_cp_like(played_after_pov_white)
            played_after_cp_like_mover = (
                played_after_cp_like_white if mover_is_white else -played_after_cp_like_white
            )

            # Also: best reply from the new position (useful for hinting next move).
            pv_after = info_after.get("pv") or []
            best_reply = pv_after[0].uci() if pv_after else None

            is_exact_best = (
                best_move_to_play is not None and played_uci == best_move_to_play.uci()
            )

            # Centipawn loss from the mover's perspective.
            # If we couldn't compute a best-after eval, default loss to 0.
            loss = 0
            if best_after_cp_like_mover is not None:
                loss = max(0, int(best_after_cp_like_mover - played_after_cp_like_mover))

            grade = _grade_from_centipawn_loss(loss, is_exact_best=is_exact_best)

            plies.append(
                {
                    "ply": ply_idx,
                    "uci": played_uci,
                    "san": san,
                    "eval": played_after_eval_json,
                    # Best move the engine wanted for the player who moved (from BEFORE the move)
                    "bestMove": best_move_to_play.uci() if best_move_to_play else None,
                    # Best reply for the opponent (from AFTER the move)
                    "bestReply": best_reply,
                    # Eval after the bestMove (optional, but useful for UI/explanations)
                    "bestEval": best_after_eval_json,
                    "centipawnLoss": loss,
                    "grade": grade,
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


