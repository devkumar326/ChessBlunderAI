import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import ChessBoard from "../components/ChessBoard/ChessBoard";
import GamePlayTray from "../components/GamePlayTray/GamePlayTray";
import MoveHistory from "../components/MoveHistory/MoveHistory";
import GameSummary from "../components/GameSummary/GameSummary";
import AnalysisSummary from "../components/AnalysisSummary/AnalysisSummary";
import MoveExplanation from "../components/MoveExplanation/MoveExplanation";
import LearningInsights from "../components/LearningInsights/LearningInsights";
import type {
  Analysis,
  LearningInsights as LearningInsightsType,
} from "../api/analyze.api";
import { useChessAudio } from "../hooks/useChessAudio";

export type AnalysisRouteState = {
  pgn: string;
  names: { white: string; black: string };
  analysis: Analysis | null;
};

function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as AnalysisRouteState | null;

  const hasData = Boolean(
    routeState && (routeState.pgn?.trim() || routeState.analysis)
  );

  useEffect(() => {
    if (!hasData) {
      navigate("/", { replace: true });
    }
  }, [hasData, navigate]);

  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(
    null
  );
  const [learningInsights, setLearningInsights] =
    useState<LearningInsightsType | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "analysis" | "history" | "learning"
  >("analysis");
  const { playSound } = useChessAudio();

  const playerNames = routeState?.names ?? null;
  const analysis = routeState?.analysis ?? null;
  const moves = useMemo(() => {
    if (!routeState) return [];
    if (routeState.analysis?.plies?.length) {
      return routeState.analysis.plies.map((p) => p.san);
    }
    try {
      const chess = new Chess();
      chess.loadPgn(routeState.pgn, { strict: false });
      return chess.history();
    } catch {
      return [];
    }
  }, [routeState]);

  const handlePlayerColorChange = (color: "white" | "black") => {
    setPlayerColor(color);
  };

  const handleReset = () => {
    navigate("/", { replace: false });
  };

  const currentFen = useMemo(() => {
    const chess = new Chess();
    for (let i = 0; i < moveIndex; i++) {
      chess.move(moves[i]);
    }
    return chess.fen();
  }, [moves, moveIndex]);

  const currentMoveAnnotation = useMemo(() => {
    const activePly = Math.max(0, moveIndex - 1);
    if (activePly < 0 || !analysis?.plies?.[activePly]) return null;
    const ply = analysis.plies[activePly];
    if (!["Inaccuracy", "Mistake", "Blunder"].includes(ply.grade)) return null;
    return {
      grade: ply.grade,
      centipawnLoss: ply.centipawnLoss,
      reason: ply.reason,
      uci: ply.uci,
    };
  }, [moveIndex, analysis]);

  const currentMoveExplanation = useMemo(() => {
    const activePly = Math.max(0, moveIndex - 1);
    if (activePly < 0 || !analysis?.plies?.[activePly]) return null;
    const ply = analysis.plies[activePly];
    if (!ply.reason) return null;
    const moveNumber = Math.floor(activePly / 2) + 1;
    const isWhite = activePly % 2 === 0;
    return {
      grade: ply.grade,
      reason: ply.reason,
      san: ply.san,
      moveNumber,
      isWhite,
    };
  }, [moveIndex, analysis]);

  const getMoveType = useMemo(() => {
    return (
      sanMove: string,
      chess: Chess
    ): "capture" | "castle" | "check" | "promote" | "self" | "opponent" => {
      if (sanMove === "O-O" || sanMove === "O-O-O") return "castle";
      if (sanMove.includes("=")) return "promote";
      if (sanMove.includes("x")) return "capture";
      if (sanMove.includes("+") || sanMove.includes("#")) return "check";
      const isWhiteTurn = chess.turn() === "w";
      return isWhiteTurn ? "opponent" : "self";
    };
  }, []);

  useEffect(() => {
    if (isPlaying || moves.length === 0 || moveIndex === 0) return;
    const lastMoveIndex = moveIndex - 1;
    if (lastMoveIndex < 0 || lastMoveIndex >= moves.length) return;
    const chess = new Chess();
    for (let i = 0; i <= lastMoveIndex; i++) {
      chess.move(moves[i]);
    }
    if (chess.isGameOver() && chess.isCheckmate()) {
      playSound("game-end");
      return;
    }
    const moveType = getMoveType(moves[lastMoveIndex], chess);
    playSound(moveType);
  }, [moveIndex, moves, isPlaying, playSound, getMoveType]);

  useEffect(() => {
    if (!isPlaying || moves.length === 0 || moveIndex >= moves.length) return;
    const id = window.setInterval(() => {
      setMoveIndex((idx) => {
        const next = idx + 1;
        if (next > 0 && next <= moves.length) {
          const chess = new Chess();
          for (let i = 0; i < next; i++) chess.move(moves[i]);
          if (chess.isGameOver() && chess.isCheckmate()) {
            playSound("game-end");
          } else {
            const moveType = getMoveType(moves[next - 1], chess);
            playSound(moveType);
          }
        }
        return next > moves.length ? moves.length : next;
      });
    }, 800);
    return () => window.clearInterval(id);
  }, [isPlaying, moveIndex, moves.length, moves, playSound, getMoveType]);

  useEffect(() => {
    if (isPlaying && moveIndex >= moves.length) setIsPlaying(false);
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
    if (moveIndex >= moves.length) setMoveIndex(0);
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

  if (!hasData) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="text-3xl font-bold">ChessBlunder AI ♟️</div>
      <div className="flex items-start justify-center gap-6 w-full">
        <div className="flex-[2]">
          {playerColor ? (
            <>
              <ChessBoard
                playerColor={playerColor}
                playerNames={playerNames}
                positionFen={currentFen}
                isInteractive={false}
                currentMoveAnnotation={currentMoveAnnotation}
              />
              {currentMoveExplanation && (
                <MoveExplanation
                  grade={currentMoveExplanation.grade}
                  reason={currentMoveExplanation.reason}
                  san={currentMoveExplanation.san}
                  moveNumber={currentMoveExplanation.moveNumber}
                  isWhite={currentMoveExplanation.isWhite}
                />
              )}
            </>
          ) : (
            <div className="w-full max-w-2xl mx-auto border border-dashed border-zinc-500 rounded-md p-8 text-center text-zinc-400">
              Pick a color to view the board.
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col border border-zinc-600 rounded-md p-4 bg-zinc-800/80 max-h-[900px]">
          {!playerColor ? (
            <>
              <div className="text-lg font-bold text-zinc-100">
                Pick your color
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-md border border-zinc-400 hover:bg-white"
                  onClick={() => handlePlayerColorChange("white")}
                >
                  White
                </button>
                <button
                  className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md border border-zinc-500 hover:bg-zinc-700"
                  onClick={() => handlePlayerColorChange("black")}
                >
                  Black
                </button>
              </div>
              <button
                className="mt-4 underline text-sm text-zinc-400 hover:text-zinc-200"
                onClick={handleReset}
              >
                Analyze a different PGN
              </button>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-center text-zinc-100">
                Analyze PGN
              </div>
              <div className="text-sm text-zinc-400 mt-1 text-center">
                Viewing as{" "}
                <span className="font-semibold text-zinc-200">
                  {playerColor}
                </span>
                .
              </div>

              {analysis && playerNames && (
                <GameSummary
                  plies={analysis.plies}
                  playerNames={playerNames}
                  finalEval={analysis.finalEval}
                  gameResult={analysis.headers?.Result}
                  playerColor={playerColor}
                />
              )}

              <div className="mt-3 border-b border-zinc-600 text-center">
                <div className="flex gap-1">
                  {(
                    [
                      ["analysis", "Analysis"],
                      ["history", "History"],
                      ["learning", "Learning ✨"],
                    ] as const
                  ).map(([tab, label]) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                        activeTab === tab
                          ? "border-amber-500 text-amber-400"
                          : "border-transparent text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto mt-3 min-h-0">
                {activeTab === "analysis" && analysis && playerNames && (
                  <AnalysisSummary
                    plies={analysis.plies}
                    playerNames={playerNames}
                  />
                )}
                {activeTab === "history" && (
                  <MoveHistory
                    moves={moves}
                    moveIndex={moveIndex}
                    onJumpToPly={handleJumpToPly}
                    moveMeta={analysis?.plies ?? null}
                  />
                )}
                {activeTab === "learning" && analysis && playerColor && (
                  <LearningInsights
                    plies={analysis.plies}
                    playerColor={playerColor}
                    headers={analysis.headers}
                    insights={learningInsights}
                    onInsights={setLearningInsights}
                  />
                )}
              </div>

              <div className="flex-shrink-0">
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
                <button
                  className="mt-4 underline text-sm text-zinc-400 hover:text-zinc-200"
                  onClick={handleReset}
                >
                  Analyze a different PGN
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
