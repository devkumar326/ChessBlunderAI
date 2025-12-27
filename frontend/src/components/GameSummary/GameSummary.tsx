import { useState } from "react";

type AnalysisPly = {
  ply: number;
  san: string;
  grade: string;
  centipawnLoss: number;
  reason?: string;
};

type Props = {
  plies: AnalysisPly[];
  playerNames: { white: string; black: string };
  finalEval: { type: "cp" | "mate"; value: number };
  gameResult?: string; // from PGN headers
  playerColor?: "white" | "black"; // Selected player perspective
};

export default function GameSummary({ plies, playerNames, finalEval, gameResult, playerColor }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!plies || plies.length === 0) {
    return null;
  }

  // Determine game result
  const getGameResult = (): { winner: string | null; resultText: string } => {
    if (gameResult === "1-0") {
      return { winner: "white", resultText: `${playerNames.white} wins` };
    } else if (gameResult === "0-1") {
      return { winner: "black", resultText: `${playerNames.black} wins` };
    } else if (gameResult === "1/2-1/2") {
      return { winner: null, resultText: "Draw" };
    }

    // Fallback: determine from final eval
    if (finalEval.type === "mate") {
      if (finalEval.value > 0) {
        return { winner: "white", resultText: `${playerNames.white} wins` };
      } else if (finalEval.value < 0) {
        return { winner: "black", resultText: `${playerNames.black} wins` };
      }
    } else if (Math.abs(finalEval.value) > 1000) {
      if (finalEval.value > 1000) {
        return { winner: "white", resultText: `${playerNames.white} wins` };
      } else {
        return { winner: "black", resultText: `${playerNames.black} wins` };
      }
    }

    return { winner: null, resultText: "Game in progress" };
  };

  // Format evaluation
  const formatEval = (): string => {
    if (finalEval.type === "mate") {
      const mateIn = Math.abs(finalEval.value);
      return finalEval.value > 0 ? `+M${mateIn}` : `−M${mateIn}`;
    }
    const cpValue = finalEval.value / 100;
    return cpValue >= 0 ? `+${cpValue.toFixed(1)}` : `${cpValue.toFixed(1)}`;
  };

  // Count blunders and mistakes by player
  const getCounts = () => {
    const counts = {
      white: { blunders: 0, mistakes: 0, inaccuracies: 0 },
      black: { blunders: 0, mistakes: 0, inaccuracies: 0 },
    };

    plies.forEach((ply, idx) => {
      const isWhite = idx % 2 === 0;
      const player = isWhite ? "white" : "black";

      if (ply.grade === "Blunder") counts[player].blunders++;
      else if (ply.grade === "Mistake") counts[player].mistakes++;
      else if (ply.grade === "Inaccuracy") counts[player].inaccuracies++;
    });

    return counts;
  };

  // Find critical moment (biggest centipawn loss for the selected player)
  const getCriticalMoment = (): { notation: string; grade: string; loss: number } | null => {
    let maxLoss = 0;
    let criticalPly: AnalysisPly | undefined = undefined;

    plies.forEach((ply, index) => {
      // Filter by player color if specified
      if (playerColor) {
        const plyIsWhite = index % 2 === 0;
        const isPlayerMove = (playerColor === "white" && plyIsWhite) || (playerColor === "black" && !plyIsWhite);
        
        if (!isPlayerMove) {
          return; // Skip opponent's moves
        }
      }

      if (ply.centipawnLoss > maxLoss) {
        maxLoss = ply.centipawnLoss;
        criticalPly = ply;
      }
    });

    if (!criticalPly || maxLoss < 100) {
      return null;
    }

    const ply: AnalysisPly = criticalPly;
    const moveNumber = Math.floor(ply.ply / 2) + 1;
    const isWhite = (ply.ply - 1) % 2 === 0;
    const notation = isWhite ? `${moveNumber}. ${ply.san}` : `${moveNumber}... ${ply.san}`;
    return { notation, grade: ply.grade, loss: maxLoss };
  };

  // Generate key factors (max 3)
  const getKeyFactors = (): string[] => {
    const factors: string[] = [];
    const counts = getCounts();

    // Check for blunders
    if (counts.white.blunders >= 2) {
      factors.push(`❌ ${playerNames.white} blundered ${counts.white.blunders} times`);
    } else if (counts.white.blunders === 1) {
      factors.push(`❌ ${playerNames.white} made a critical blunder`);
    }

    if (counts.black.blunders >= 2) {
      factors.push(`❌ ${playerNames.black} blundered ${counts.black.blunders} times`);
    } else if (counts.black.blunders === 1) {
      factors.push(`❌ ${playerNames.black} made a critical blunder`);
    }

    // Check for multiple mistakes
    if (counts.white.mistakes >= 3 && factors.length < 3) {
      factors.push(`⚠️ ${playerNames.white} made ${counts.white.mistakes} mistakes`);
    }
    if (counts.black.mistakes >= 3 && factors.length < 3) {
      factors.push(`⚠️ ${playerNames.black} made ${counts.black.mistakes} mistakes`);
    }

    // Check for king safety issues (look for "king" in reasons)
    if (factors.length < 3) {
      const kingSafetyIssues = plies.filter((p) => 
        p.reason?.toLowerCase().includes("king") && 
        (p.grade === "Mistake" || p.grade === "Blunder")
      );
      if (kingSafetyIssues.length > 0) {
        const firstIssue = kingSafetyIssues[0];
        const moveNumber = Math.floor(firstIssue.ply / 2) + 1;
        const player = (firstIssue.ply - 1) % 2 === 0 ? playerNames.white : playerNames.black;
        factors.push(`👑 ${player}'s king safety compromised (move ${moveNumber})`);
      }
    }

    // Check for material losses (hanging pieces)
    if (factors.length < 3) {
      const materialLosses = plies.filter((p) => 
        p.reason?.toLowerCase().includes("hangs") && 
        (p.grade === "Mistake" || p.grade === "Blunder")
      );
      if (materialLosses.length >= 2) {
        factors.push(`⚡ Multiple pieces hung during the game`);
      }
    }

    // Check for missed mates
    if (factors.length < 3) {
      const missedMates = plies.filter((p) => 
        p.reason?.toLowerCase().includes("misses mate")
      );
      if (missedMates.length > 0) {
        const player = (missedMates[0].ply - 1) % 2 === 0 ? playerNames.white : playerNames.black;
        factors.push(`🎯 ${player} missed a forced mate`);
      }
    }

    // Generic fallback based on eval
    if (factors.length < 3) {
      const result = getGameResult();
      if (result.winner === "white") {
        factors.push(`✓ ${playerNames.white} maintained advantage`);
      } else if (result.winner === "black") {
        factors.push(`✓ ${playerNames.black} converted advantage`);
      }
    }

    return factors.slice(0, 3); // Max 3 factors
  };

  const result = getGameResult();
  const evalText = formatEval();
  const keyFactors = getKeyFactors();
  const criticalMoment = getCriticalMoment();

  return (
    <div className="mt-3 border border-gray-300 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 border-b border-gray-200 bg-white/50 hover:bg-white/70 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-semibold text-gray-800">Game Summary</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 space-y-3">
          {/* Result and Final Eval */}
          <div>
            <div className="text-base font-bold text-gray-900">
              {result.resultText}
            </div>
            <div className="text-sm text-gray-600">
              Final Eval: <span className="font-semibold font-mono">{evalText}</span>
            </div>
          </div>

          {/* Key Factors */}
          {keyFactors.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1.5">Key factors:</div>
              <div className="space-y-1">
                {keyFactors.map((factor, idx) => (
                  <div key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Moment */}
          {criticalMoment && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1.5">
                {playerColor ? `Your biggest mistake:` : `Turning point:`}
              </div>
              <div className="bg-white/70 border border-indigo-200 rounded px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {criticalMoment.notation}
                  </span>
                  <span className="text-xs font-medium text-orange-700">
                    {criticalMoment.grade}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  −{criticalMoment.loss} centipawns
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

