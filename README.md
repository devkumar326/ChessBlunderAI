## ChessBlunder AI

ChessBlunder AI is a full-stack chess analysis app that accepts a chess **PGN**, runs **Stockfish** analysis on the backend, and displays move-by-move evaluations with quality grading in a clean, interactive UI.

### Features

- 🎯 **Move Quality Grading**: Automatically grades each move as Best, Excellent, Good, Inaccuracy, Mistake, or Blunder
- 📊 **Centipawn Loss Tracking**: Shows exact evaluation loss for each move
- 🎮 **Interactive Game Replay**: Step through games move-by-move with visual board updates
- 📈 **Analysis Summary**: View game statistics including total blunders, mistakes, and inaccuracies per player
- ⚡ **Stockfish Integration**: Powered by Stockfish chess engine for accurate position evaluation
- 🎨 **Visual Indicators**: Color-coded move quality icons for easy identification

### Repo structure

- **`frontend/`**: React + TypeScript + Vite UI (PGN paste + board + move history)
- **`backend/`**: FastAPI service that analyzes PGN with Stockfish

### Quickstart (recommended)

#### Start the backend (Docker)

From the repo root:

```bash
docker compose up --build
```

Backend will be available at `http://localhost:8000`.

#### Start the frontend (local)

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

### Configuration

#### Frontend → Backend base URL

By default the frontend calls the backend at `http://localhost:8000`.

To override, create `frontend/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### API (backend)

- **GET `/`**: health-ish root message
- **POST `/pgn`**: analyze a PGN with Stockfish

Example:

```bash
curl -X POST "http://localhost:8000/pgn" \
  -H "Content-Type: application/json" \
  -d '{"pgn":"[Event \"Casual Game\"]\n[Site \"?\"]\n[Date \"2025.12.26\"]\n[Round \"-\"]\n[White \"White\"]\n[Black \"Black\"]\n[Result \"1-0\"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0\n"}'
```

Response shape (high level):

- **`ok`**: boolean
- **`analysis`**:
  - `headers`: PGN headers map
  - `depth`: Stockfish depth used
  - `stockfishPath`: resolved path to engine binary
  - `finalFen`: final board position (FEN)
  - `finalEval`: `{ type: "cp" | "mate", value: number }`
  - `plies`: list of per-half-move objects:
    - `ply`: half-move number (1, 2, 3...)
    - `uci`: move in UCI notation (e.g., "e2e4")
    - `san`: move in Standard Algebraic Notation (e.g., "e4")
    - `eval`: position evaluation after the move
    - `bestMove`: Stockfish's recommended best move
    - `grade`: move quality grade ("Best", "Excellent", "Good", "Inaccuracy", "Mistake", "Blunder")
    - `centipawnLoss`: evaluation loss compared to best move (0 for best moves)

Interactive Swagger docs are at `http://localhost:8000/docs`.

### Move Grading System

Moves are automatically graded based on centipawn loss:

- **Best** (⭐): Stockfish's top choice (0 centipawn loss)
- **Excellent** (💚): 0-10 centipawn loss
- **Good** (✅): 10-25 centipawn loss
- **Inaccuracy** (⚠️): 25-100 centipawn loss
- **Mistake** (❌): 100-300 centipawn loss
- **Blunder** (💥): 300+ centipawn loss


