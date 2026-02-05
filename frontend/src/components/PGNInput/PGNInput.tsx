import { useState } from "react";
import { sendPgn, type Analysis } from "../../api/analyze.api";
import { getPlayerNamesFromPgn } from "../../utils/pgn";

export type PGNInputProps = {
  handleAnalyze: (data: {
    pgn: string;
    names: { white: string; black: string };
    analysis: Analysis | null;
  }) => void;
  /** When provided, textarea is controlled by parent (e.g. for "Try Sample PGN"). */
  value?: string;
  onChange?: (value: string) => void;
};

const PGNInput = ({ handleAnalyze, value, onChange }: PGNInputProps) => {
  const [internalPgn, setInternalPgn] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isControlled = value !== undefined && onChange !== undefined;
  const pgn = isControlled ? value : internalPgn;
  const setPgn = isControlled ? onChange : setInternalPgn;

  const handlePgnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPgn(e.target.value);
  };

  const handlePgnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const names = getPlayerNamesFromPgn(pgn);
      const res = await sendPgn(pgn);
      handleAnalyze({ pgn, names, analysis: res.analysis });
    } catch (err: any) {
      console.error("Failed to send PGN to backend:", err);
      const isTimeout = err?.code === "ECONNABORTED" || err?.message?.includes("timeout");
      const errorMsg = isTimeout
        ? "Analysis timed out. This can happen with very long games or slow engines. Try reducing the game length or wait for the backend to finish."
        : "Analysis failed. Please check your PGN and backend connection. See console for details.";
      alert(errorMsg);
      // Don't proceed on error - keep user on the input screen
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={handlePgnSubmit} className="flex flex-col gap-4">
      <textarea
        value={pgn}
        onChange={handlePgnChange}
        className="w-full h-48 border border-grey-100 rounded-md p-2"
        placeholder="Paste your PGN file here"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!pgn.trim() || isLoading}
      >
        {isLoading ? "Analyzing with Stockfish... (this may take 1-2 minutes)" : "Analyze"}
      </button>
    </form>
  );
};

export default PGNInput;
