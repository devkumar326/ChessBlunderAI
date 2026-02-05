import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPgn } from "../api/analyze.api";
import { getPlayerNamesFromPgn, SAMPLE_PGN } from "../utils/pgn";

const PGN_PLACEHOLDER = `[Event "Casual Game"]
[Site "ChessBlunder AI"]
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6...`;

function BulletIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-lg font-bold">
      !
    </span>
  );
}
function LightbulbIcon() {
  return (
    <svg
      className="h-10 w-10 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg
      className="h-10 w-10 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg
      className="h-6 w-6 shrink-0 text-amber-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      className="size-4 shrink-0"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  );
}

const Landing = () => {
  const navigate = useNavigate();
  const [pgn, setPgn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrySample = () => {
    setPgn(SAMPLE_PGN);
    setError(null);
  };

  const handleAnalyze = async () => {
    const trimmed = pgn.trim();
    if (!trimmed) return;
    setError(null);
    setIsLoading(true);
    try {
      const names = getPlayerNamesFromPgn(trimmed);
      const { analysis } = await sendPgn(trimmed);
      navigate("/analysis", {
        state: { pgn: trimmed, names, analysis },
        replace: false,
      });
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      const isTimeout =
        axiosErr?.code === "ECONNABORTED" ||
        String(axiosErr?.message || "").includes("timeout");
      setError(
        isTimeout
          ? "Analysis timed out. Try a shorter game or try again."
          : "Analysis failed. Check your PGN and connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-400">
          Level Up Your Game
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Master Every Move.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-300">
          Upload your PGN and let our AI engine dissect your performance,
          revealing hidden blunders and winning lines.
        </p>

        <div className="mt-10">
          <label
            htmlFor="pgn-input"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-100"
          >
            Paste PGN Data
          </label>
          <textarea
            id="pgn-input"
            value={pgn}
            onChange={(e) => {
              setPgn(e.target.value);
              setError(null);
            }}
            placeholder={PGN_PLACEHOLDER}
            rows={8}
            className="mt-2 w-full resize-y rounded-lg border border-zinc-600 bg-zinc-900/80 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
            {InfoIcon()}
            Supports all standard PGN formats
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTrySample}
              className="rounded-lg border-2 border-amber-500 bg-transparent px-6 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              Try Sample PGN
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!pgn.trim() || isLoading}
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              {isLoading ? "Analyzing…" : "Analyze Game"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-3">
            <div className="flex flex-col items-start">
              <BulletIcon />
              <h3 className="mt-4 text-lg font-bold text-white">
                Blunder Detection
              </h3>
              <p className="mt-2 text-zinc-400">
                Instant identification of game-changing mistakes with detailed
                refutations.
              </p>
            </div>
            <div className="flex flex-col items-start">
              <LightbulbIcon />
              <h3 className="mt-4 text-lg font-bold text-white">
                Move Suggestions
              </h3>
              <p className="mt-2 text-zinc-400">
                Engine-backed alternatives so you see the best reply and why
                your move fell short.
              </p>
            </div>
            <div className="flex flex-col items-start">
              <ChartIcon />
              <h3 className="mt-4 text-lg font-bold text-white">
                Elo Estimation
              </h3>
              <p className="mt-2 text-zinc-400">
                Understand strength and accuracy through centipawn loss and move
                grades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Resources */}
      <section className="border-t border-zinc-800 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Learning Resources
          </p>
          <h2 className="mt-1 text-2xl font-bold italic text-amber-400 sm:text-3xl">
            Mastering the PGN Format
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <article className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-6">
              <div className="flex items-start gap-3">
                <DocumentIcon />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    What is a PGN File?
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Portable Game Notation (PGN) is the standard plain-text
                    format for recording chess games. It is designed to be
                    easily readable by humans and easily parsed by computer
                    programs. A typical PGN contains &quot;Tag Pairs&quot;
                    (metadata like players, date, and result) followed by the
                    &quot;Movetext&quot; (the actual moves played in algebraic
                    notation). This format allows players to archive, share, and
                    analyze games across different platforms seamlessly.
                  </p>
                </div>
              </div>
            </article>
            <article className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-6">
              <div className="flex items-start gap-3">
                <GearIcon />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Engine-Led Improvement
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Integrating the Stockfish engine into your study routine
                    transforms a simple PGN into a powerful learning tool. By
                    analyzing your moves against an engine&apos;s evaluation,
                    you identify objective truth in complex positions. Engine
                    analysis helps you recognize tactical patterns you missed,
                    understand the evaluation of specific openings, and find
                    precise defensive resources in difficult endgames. It&apos;s
                    like having a grandmaster coach review every game you play.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
