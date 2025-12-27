import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "../components/ChessBoard/ChessBoard";
import GamePlayTray from "../components/GamePlayTray/GamePlayTray";
import MoveHistory from "../components/MoveHistory/MoveHistory";
import PGNInput from "../components/PGNInput/PGNInput";
import AnalysisSummary from "../components/AnalysisSummary/AnalysisSummary";
import type { Analysis } from "../api/analyze.api";

const Home = () => {
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [playerNames, setPlayerNames] = useState<{ white: string; black: string } | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgnError, setPgnError] = useState<string | null>(null);

  const handlePlayerColorChange = (color: "white" | "black") => {
    setPlayerColor(color);
  };
  const handleAnalyze = (data: {
    pgn: string;
    names: { white: string; black: string };
    analysis: Analysis | null;
  }) => {
    setPgnError(null);
    setIsPlaying(false);
    setMoveIndex(0);
    setPlayerNames(data.names);
    // After analyzing a PGN, ask the user to pick a side.
    setPlayerColor(null);

    setAnalysis(data.analysis);
    if (data.analysis?.plies?.length) {
      // Use backend SAN so grading aligns with the shown move list.
      setMoves(data.analysis.plies.map((p) => p.san));
      return;
    }

    // Fallback: parse locally if backend analysis wasn't available.
    const chess = new Chess();
    try {
      chess.loadPgn(data.pgn, { strict: false });
      setMoves(chess.history());
    } catch {
      setMoves([]);
      setPgnError("Could not parse PGN. Please paste a valid PGN and try again.");
    }
  };

  const handleReset = () => {
    setPlayerNames(null);
    setPlayerColor(null);
    setMoves([]);
    setAnalysis(null);
    setMoveIndex(0);
    setIsPlaying(false);
    setPgnError(null);
  };

  const currentFen = useMemo(() => {
    const chess = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      chess.move(moves[i]);
    }
    return chess.fen();
  }, [moves, moveIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    if (moves.length === 0) return;
    if (moveIndex >= moves.length) return;

    const id = window.setInterval(() => {
      setMoveIndex((idx) => {
        const next = idx + 1;
        return next > moves.length ? moves.length : next;
      });
    }, 800);

    return () => window.clearInterval(id);
  }, [isPlaying, moveIndex, moves.length]);

  // Auto-pause at the end.
  useEffect(() => {
    if (isPlaying && moveIndex >= moves.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, moveIndex, moves.length]);

  const handlePrev = () => {
    setIsPlaying(false);
    setMoveIndex((i) => Math.max(0, i - 1));
  };
  const handleNext = () => {
    setIsPlaying(false);
    setMoveIndex((i) => Math.min(moves.length, i + 1));
  };
  const handleTogglePlay = () => {
    if (moves.length === 0) return;
    if (moveIndex >= moves.length) {
      setMoveIndex(0);
    }
    setIsPlaying((p) => !p);
  };
  const handleJumpToPly = (plyIndex: number) => {
    setIsPlaying(false);
    setMoveIndex(Math.max(0, Math.min(moves.length, plyIndex)));
  };
  const handleJumpToStart = () => {
    setIsPlaying(false);
    setMoveIndex(0);
  };
  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setMoveIndex(moves.length);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="text-2xl font-bold">ChessBlunder AI</div>
      <div className="flex items-stretch justify-center gap-4 p-4 w-full">
        <div className="flex-[2] self-stretch">
          {playerColor ? (
            <ChessBoard
              playerColor={playerColor}
              playerNames={playerNames}
              positionFen={currentFen}
              isInteractive={false}
            />
          ) : (
            <div className="w-full max-w-2xl mx-auto border border-dashed border-gray-400 rounded-md p-8 text-center text-gray-600">
              {playerNames ? "Pick a color to view the board." : "Paste a PGN and click Analyze."}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col self-stretch border border-grey-100 rounded-md p-4 bg-gray-300">
          {!playerNames ? (
            <>
              <div className="text-lg font-bold">Analyze your Game</div>
              <PGNInput handleAnalyze={handleAnalyze} />
              {pgnError && <div className="mt-3 text-sm text-red-700">{pgnError}</div>}
            </>
          ) : !playerColor ? (
            <>
              <div className="text-lg font-bold">Pick your color</div>
              <div className="flex gap-3 mt-2">
                <button
                  className="bg-white text-black px-4 py-2 rounded-md border border-gray-400"
                  onClick={() => handlePlayerColorChange("white")}
                >
                  White
                </button>
                <button
                  className="bg-black text-white px-4 py-2 rounded-md"
                  onClick={() => handlePlayerColorChange("black")}
                >
                  Black
                </button>
              </div>
              <button className="mt-4 underline text-sm text-gray-700" onClick={handleReset}>
                Analyze a different PGN
              </button>
            </>
          ) : (
            <>
              <div className="text-lg font-bold">Analyze PGN</div>
              <div className="text-sm text-gray-700 mt-1">
                Viewing as <span className="font-semibold">{playerColor}</span>.
              </div>
              {analysis && playerNames && (
                <AnalysisSummary plies={analysis.plies} playerNames={playerNames} />
              )}
              <MoveHistory
                moves={moves}
                moveIndex={moveIndex}
                onJumpToPly={handleJumpToPly}
                moveMeta={analysis?.plies ?? null}
              />
              <GamePlayTray
                isPlaying={isPlaying}
                moveIndex={moveIndex}
                moveCount={moves.length}
                onTogglePlay={handleTogglePlay}
                onPrev={handlePrev}
                onNext={handleNext}
                onJumpToStart={handleJumpToStart}
                onJumpToEnd={handleJumpToEnd}
              />
              <button className="mt-4 underline text-sm text-gray-700" onClick={handleReset}>
                Analyze a different PGN
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;

