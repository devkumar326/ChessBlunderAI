## ChessBlunder AI (Backend)

FastAPI service that accepts a chess **PGN**, runs **Stockfish** via `python-chess`, evaluates each move, and returns a comprehensive JSON analysis payload with move quality grading.

### Tech

- FastAPI + Uvicorn
- `python-chess` (PGN parsing + Stockfish engine integration)
- Stockfish (engine binary)

### Run with Docker (recommended)

From the repo root:

```bash
docker compose up --build
```

This builds the backend image, installs Stockfish in the container, and starts Uvicorn on `http://localhost:8000`.

### Run locally (without Docker)

#### 1) Install dependencies

From `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 2) Install Stockfish

You must have a Stockfish binary available, either on your `PATH` or via `STOCKFISH_PATH`.

- macOS (Homebrew):

```bash
brew install stockfish
```

- Debian/Ubuntu:

```bash
sudo apt-get update && sudo apt-get install -y stockfish
```

#### 3) Start the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment variables

- **`STOCKFISH_PATH`** (optional): explicit path to Stockfish binary
  - If not set, the service tries `stockfish` on `PATH`, then falls back to `/usr/games/stockfish`.
- **`STOCKFISH_DEPTH`** (optional, default `12`): analysis depth passed to Stockfish
- **`ENV`** (optional): currently only used by `docker-compose.yml` as a simple environment flag

### API

#### GET `/`

Returns:

```json
{ "message": "ChessBlunder AI API" }
```

#### POST `/pgn`

Request body:

```json
{ "pgn": "..." }
```

Success response:

```json
{
  "ok": true,
  "analysis": {
    "headers": {},
    "depth": 12,
    "stockfishPath": "/usr/games/stockfish",
    "finalFen": "...",
    "finalEval": { "type": "cp", "value": 23 },
    "plies": [
      {
        "ply": 1,
        "uci": "e2e4",
        "san": "e4",
        "eval": { "type": "cp", "value": 15 },
        "bestMove": "c7c5",
        "grade": "Best",
        "centipawnLoss": 0
      },
      {
        "ply": 2,
        "uci": "e7e6",
        "san": "e6",
        "eval": { "type": "cp", "value": 45 },
        "bestMove": "c7c5",
        "grade": "Inaccuracy",
        "centipawnLoss": 30,
        "reason": "More accurate was c5, which maintains equality"
      },
      {
        "ply": 3,
        "uci": "d2d4",
        "san": "d4",
        "eval": { "type": "cp", "value": 50 },
        "bestMove": "d2d4",
        "grade": "Best",
        "centipawnLoss": 0
      }
    ]
  }
}
```

#### Move Grading

Each move is automatically graded based on centipawn loss compared to Stockfish's best move:

- **Best**: 0 centipawn loss (Stockfish's top choice)
- **Excellent**: 0-10 centipawn loss
- **Good**: 10-25 centipawn loss
- **Inaccuracy**: 25-100 centipawn loss
- **Mistake**: 100-300 centipawn loss
- **Blunder**: 300+ centipawn loss

#### Move Explanations

For moves graded as **Inaccuracy**, **Mistake**, or **Blunder**, the analysis includes a `reason` field with human-readable explanations such as:
- "Hangs the bishop: opponent can play Qg5 winning material"
- "Allows mate in 3"
- "More accurate was Nf6, which maintains the position"
- "Misses winning tactic Rxe4+ forking king and queen"

These explanations help players understand why a move was poor and what they should have played instead.

Errors:

- **400**: invalid/unparseable PGN
- **500**: Stockfish not found or analysis failed

#### PGN Input Normalization

The backend automatically normalizes PGN input to handle:
- Blank lines in movetext
- Inconsistent whitespace
- PGNs with or without headers

This makes the API robust for PGNs pasted from various sources.

### Swagger docs

OpenAPI UI is available at `http://localhost:8000/docs`.

### Troubleshooting

- **500 “Stockfish engine not found”**:
  - Install Stockfish and ensure `stockfish` is on `PATH`, or set `STOCKFISH_PATH` to the full binary path.
- **CORS issues (frontend can’t call backend)**:
  - The backend allows common local dev origins in `app/core/config.py` (including Vite’s `:5173`).


