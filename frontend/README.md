## ChessBlunder AI (Frontend)

React + TypeScript + Vite UI for pasting a **PGN** and replaying the game on a chessboard.

### Prerequisites

- Node.js (recommended: current LTS)

### Setup

```bash
npm install
```

### Run (dev)

```bash
npm run dev
```

The dev server runs at `http://localhost:5173` by default.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Configuration

#### Backend base URL

The frontend sends PGNs to the backend endpoint `POST /pgn`.

By default it uses:

- `http://localhost:8000`

Override by creating `frontend/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Notes

- The UI currently **does not render Stockfish evaluations** yet. It posts the PGN to the backend (for logging / analysis) and replays moves locally using `chess.js`.

