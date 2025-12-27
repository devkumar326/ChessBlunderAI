## ChessBlunder AI (Frontend)

React + TypeScript + Vite UI for pasting a **PGN**, analyzing it with Stockfish, and replaying the game with move-by-move quality grading and visual feedback.

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

### Features

#### UI Components

- **PGNInput**: Paste and submit PGN text for analysis
- **ChessBoard**: Interactive chess board powered by `react-chessboard`
- **MoveHistory**: Scrollable move list with quality grade icons
  - Visual indicators for each move (Best ⭐, Excellent 💚, Good ✅, Inaccuracy ⚠️, Mistake ❌, Blunder 💥)
  - Click any move to jump to that position
- **GamePlayTray**: Navigation controls (first, previous, next, last move)
- **AnalysisSummary**: Post-game statistics table showing:
  - Total blunders, mistakes, and inaccuracies per player
  - Average centipawn loss
  - Move quality breakdown

#### Move Quality Icons

The app includes custom icons for each move grade:
- `assets/best.png`
- `assets/excellent.png`
- `assets/good.png`
- `assets/innacuracy.png`
- `assets/mistake.png`
- `assets/blunder.png`

#### Dependencies

- **react-chessboard**: Chess board component
- **chess.js**: Chess game logic and validation
- **axios**: HTTP client for backend API calls

