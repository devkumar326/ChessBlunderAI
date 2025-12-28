import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "../components/ChessBoard/ChessBoard";
import GamePlayTray from "../components/GamePlayTray/GamePlayTray";
import MoveHistory from "../components/MoveHistory/MoveHistory";
import PGNInput from "../components/PGNInput/PGNInput";
import GameSummary from "../components/GameSummary/GameSummary";
import AnalysisSummary from "../components/AnalysisSummary/AnalysisSummary";
import MoveExplanation from "../components/MoveExplanation/MoveExplanation";
import LearningInsights from "../components/LearningInsights/LearningInsights";
import type { Analysis, LearningInsights as LearningInsightsType } from "../api/analyze.api";
import { useChessAudio } from "../hooks/useChessAudio";

const Home = () => {
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [playerNames, setPlayerNames] = useState<{ white: string; black: string } | null>(null);
  const [moves, setMoves] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [learningInsights, setLearningInsights] = useState<LearningInsightsType | null>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "history" | "learning">("analysis");
  const { playSound } = useChessAudio();

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
    setLearningInsights(null);
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
    setLearningInsights(null);
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

  // Get the annotation for the current move (last played move)
  const currentMoveAnnotation = useMemo(() => {
    const activePly = Math.max(0, moveIndex - 1);
    if (activePly < 0 || !analysis?.plies?.[activePly]) return null;
    
    const ply = analysis.plies[activePly];
    // Only show annotations for Inaccuracy, Mistake, and Blunder
    if (!["Inaccuracy", "Mistake", "Blunder"].includes(ply.grade)) return null;
    
    return {
      grade: ply.grade,
      centipawnLoss: ply.centipawnLoss,
      reason: ply.reason,
      uci: ply.uci,
    };
  }, [moveIndex, analysis]);

  // Get move explanation data with move number
  const currentMoveExplanation = useMemo(() => {
    const activePly = Math.max(0, moveIndex - 1);
    if (activePly < 0 || !analysis?.plies?.[activePly]) return null;
    
    const ply = analysis.plies[activePly];
    // Only show for moves with reasons
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

  // Detect move type from SAN notation and position
  const getMoveType = useMemo(() => {
    return (sanMove: string, chess: Chess): "capture" | "castle" | "check" | "promote" | "self" | "opponent" => {
      // Check for castling
      if (sanMove === "O-O" || sanMove === "O-O-O") {
        return "castle";
      }
      
      // Check for promotion
      if (sanMove.includes("=")) {
        return "promote";
      }
      
      // Check for capture
      if (sanMove.includes("x")) {
        return "capture";
      }
      
      // Check for check
      if (sanMove.includes("+") || sanMove.includes("#")) {
        return "check";
      }
      
      // Determine if self or opponent based on who's turn it was
      // After the move is played, it's the next player's turn
      const isWhiteTurn = chess.turn() === "w";
      return isWhiteTurn ? "opponent" : "self";
    };
  }, []);

  // Play sound when moveIndex changes (user interaction only, not auto-play)
  useEffect(() => {
    if (isPlaying || moves.length === 0 || moveIndex === 0) return;
    
    // Get the last played move
    const lastMoveIndex = moveIndex - 1;
    if (lastMoveIndex < 0 || lastMoveIndex >= moves.length) return;
    
    // Build position up to that move
    const chess = new Chess();
    for (let i = 0; i <= lastMoveIndex; i++) {
      chess.move(moves[i]);
    }
    
    // Check for game end
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        playSound("game-end");
        return;
      }
    }
    
    // Get move type and play sound
    const moveType = getMoveType(moves[lastMoveIndex], chess);
    playSound(moveType);
  }, [moveIndex, moves, isPlaying, playSound, getMoveType]);

  useEffect(() => {
    if (!isPlaying) return;
    if (moves.length === 0) return;
    if (moveIndex >= moves.length) return;

    const id = window.setInterval(() => {
      setMoveIndex((idx) => {
        const next = idx + 1;
        
        // Play sound for the move being made
        if (next > 0 && next <= moves.length) {
          const chess = new Chess();
          for (let i = 0; i < next; i++) {
            chess.move(moves[i]);
          }
          
          // Check for game end
          if (chess.isGameOver() && chess.isCheckmate()) {
            playSound("game-end");
          } else {
            // Get move type and play sound
            const moveType = getMoveType(moves[next - 1], chess);
            playSound(moveType);
          }
        }
        
        return next > moves.length ? moves.length : next;
      });
    }, 800);

    return () => window.clearInterval(id);
  }, [isPlaying, moveIndex, moves.length, moves, playSound, getMoveType]);

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
            <div className="w-full max-w-2xl mx-auto border border-dashed border-gray-400 rounded-md p-8 text-center text-gray-600">
              {playerNames ? "Pick a color to view the board." : "Paste a PGN and click Analyze."}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col border border-grey-100 rounded-md p-4 bg-gray-300 max-h-[900px]">
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
              <div className="text-lg font-bold text-center">Analyze PGN</div>
              <div className="text-sm text-gray-700 mt-1 text-center">
                Viewing as <span className="font-semibold">{playerColor}</span>.
              </div>
              
              {/* Game Summary - Fixed at top */}
              {analysis && playerNames && (
                <GameSummary 
                  plies={analysis.plies} 
                  playerNames={playerNames}
                  finalEval={analysis.finalEval}
                  gameResult={analysis.headers?.Result}
                  playerColor={playerColor}
                />
              )}

              {/* Tabs */}
              <div className="mt-3 border-b border-gray-300 text-center">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                      activeTab === "analysis"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                      activeTab === "history"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab("learning")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                      activeTab === "learning"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Learning ✨
                  </button>
                </div>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-auto mt-3 min-h-0">
                {activeTab === "analysis" && analysis && playerNames && (
                  <AnalysisSummary plies={analysis.plies} playerNames={playerNames} />
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

              {/* GamePlayTray - Fixed at bottom */}
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
                
                <button className="mt-4 underline text-sm text-gray-700" onClick={handleReset}>
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
export default Home;

