import axios from "axios";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

export async function sendPgn(pgn: string): Promise<{ ok: boolean }> {
  const res = await axios.post(
    `${API_BASE_URL}/pgn`,
    { pgn },
    { headers: { "Content-Type": "application/json" }, timeout: 15_000 }
  );
  return res.data;
}

