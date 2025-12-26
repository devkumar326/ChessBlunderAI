import { useState } from "react";
import { sendPgn } from "../../api/analyze.api";

function extractPgnTagValue(pgn: string, tagName: string): string | null {
  // Example tag line: [White "matheoangelo"]
  const re = new RegExp(`\\[${tagName}\\s+"([^"]*)"\\]`, "m");
  const match = pgn.match(re);
  const value = match?.[1]?.trim();
  return value ? value : null;
}

function getPlayerNamesFromPgn(pgn: string): { white: string; black: string } {
  return {
    white: extractPgnTagValue(pgn, "White") ?? "White",
    black: extractPgnTagValue(pgn, "Black") ?? "Black",
  };
}

const PGNInput = ({
  handleAnalyze,
}: {
  handleAnalyze: (data: { pgn: string; names: { white: string; black: string } }) => void;
}) => {
  const [pgn, setPgn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handlePgnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPgn(e.target.value);
  };

  const handlePgnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const names = getPlayerNamesFromPgn(pgn);
      await sendPgn(pgn);
      handleAnalyze({ pgn, names });
    } catch (err) {
      // Keep UI simple for now; backend logging is the main goal.
      console.error("Failed to send PGN to backend:", err);
      const names = getPlayerNamesFromPgn(pgn);
      handleAnalyze({ pgn, names });
    } finally {
      setIsLoading(false);
    }
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
        className="bg-blue-500 text-white p-2 rounded-md"
        disabled={!pgn.trim() || isLoading}
      >
        {isLoading ? "Analyzing..." : "Analyze"}
      </button>
    </form>
  );
};

export default PGNInput;
