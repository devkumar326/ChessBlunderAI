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
- **Player Color Selection**: Choose to view the game from White or Black's perspective
- **ChessBoard**: Interactive chess board powered by `react-chessboard`
  - On-board move quality annotations (displayed during gameplay)
  - Player names displayed above/below the board based on perspective
- **GameSummary**: Fixed header showing:
  - Game result and player names
  - Live evaluation bar (white/black advantage)
  - Quick stats: total moves, blunders, mistakes per player
- **Tabbed Analysis Interface**:
  - **Analysis Tab**: Detailed statistics table showing:
    - Total blunders, mistakes, and inaccuracies per player
    - Average centipawn loss
    - Move quality breakdown by percentage
  - **History Tab**: Scrollable move list with quality grade icons
    - Visual indicators for each move (Best ⭐, Excellent 💚, Good ✅, Inaccuracy ⚠️, Mistake ❌, Blunder 💥)
    - Click any move to jump to that position
- **MoveExplanation**: Inline explanations for poor moves
  - Displays move number, SAN notation, and detailed reasoning
  - Only shown for Inaccuracies, Mistakes, and Blunders
- **GamePlayTray**: Navigation controls (first, previous, next, last move, play/pause)
  - Auto-play functionality with synchronized sound effects

#### Audio Feedback

The app includes contextual sound effects for different move types:
- **Capture**: Piece captures
- **Castle**: Castling moves (O-O, O-O-O)
- **Check**: Moves that give check
- **Promote**: Pawn promotions
- **Self**: Regular moves by the player
- **Opponent**: Regular moves by the opponent
- **Game End**: Checkmate detection

Audio files are located in `assets/audios/` (WebM format).

#### Move Quality Icons

The app includes custom PNG icons for each move grade:
- `assets/best.png`
- `assets/excellent.png`
- `assets/good.png`
- `assets/inaccuracy.png`
- `assets/mistake.png`
- `assets/blunder.png`

#### Dependencies

- **react-chessboard**: Chess board component
- **chess.js**: Chess game logic and validation
- **axios**: HTTP client for backend API calls

### User Workflow

1. **Paste PGN**: Paste any valid PGN into the input field
2. **Analyze**: Click "Analyze" to send PGN to backend for Stockfish analysis
3. **Pick Color**: Choose to view the game as White or Black
4. **Review Game**: Navigate through moves using:
   - Arrow buttons (first, previous, next, last)
   - Auto-play button for continuous playback
   - Clicking directly on moves in the History tab
5. **Study Mistakes**: View detailed explanations for poor moves with visual annotations

