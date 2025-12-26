## ChessBlunder AI

ChessBlunder AI is a small full-stack app that accepts a chess **PGN**, runs **Stockfish** analysis on the backend, and lets you replay the game in a clean UI.

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
    - `ply`, `uci`, `san`, `eval`, `bestMove`

Interactive Swagger docs are at `http://localhost:8000/docs`.

### Notes

- **Current UI behavior**: the frontend sends the PGN to the backend, but it currently replays the game using `chess.js` locally and does not display the backend analysis yet.


