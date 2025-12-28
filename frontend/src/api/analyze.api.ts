import axios from "axios";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

export type EvalJson =
  | { type: "cp"; value: number }
  | { type: "mate"; value: number };

export type AnalysisPly = {
  ply: number;
  uci: string;
  san: string;
  eval: EvalJson;
  bestMove: string | null; // engine best move for the side who played this ply
  bestReply: string | null; // engine best reply after the played move
  bestEval: EvalJson | null; // eval after bestMove
  centipawnLoss: number;
  grade: "Best" | "Excellent" | "Good" | "Inaccuracy" | "Mistake" | "Blunder";
  reason?: string; // Human-readable explanation for poor moves
};

export type Analysis = {
  headers: Record<string, string>;
  depth: number;
  stockfishPath: string;
  finalFen: string;
  finalEval: EvalJson;
  plies: AnalysisPly[];
};

export async function sendPgn(
  pgn: string
): Promise<{ ok: boolean; analysis: Analysis }> {
  const res = await axios.post(
    `${API_BASE_URL}/pgn`,
    { pgn },
    { 
      headers: { "Content-Type": "application/json" }, 
      timeout: 180_000  // 3 minutes - deep analysis of long games can take time
    }
  );
  return res.data;
}

export type ErrorCount = {
  blunders: number;
  mistakes: number;
  inaccuracies: number;
};

export type LearningInsights = {
  insights: string;
  errorCount: ErrorCount;
  playerColor: string;
  error?: string;
};

export async function getLearningInsights(
  plies: AnalysisPly[],
  playerColor: "white" | "black",
  headers?: Record<string, string>
): Promise<{ ok: boolean; data: LearningInsights }> {
  const res = await axios.post(
    `${API_BASE_URL}/learning-insights`,
    { 
      plies,
      playerColor,
      headers 
    },
    { 
      headers: { "Content-Type": "application/json" }, 
      timeout: 60_000  // 1 minute for LLM generation
    }
  );
  return res.data;
}

