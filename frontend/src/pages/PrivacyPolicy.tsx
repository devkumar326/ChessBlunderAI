import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-100">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">Overview</h2>
        <p className="mt-2 text-zinc-400">
          ChessBlunder AI is built to analyze chess games you provide. This
          page describes how we handle information in connection with that
          service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Information you provide
        </h2>
        <p className="mt-2 text-zinc-400">
          When you paste a PGN and run analysis, we process the game data (moves
          and optional headers such as player names and event) on our servers to
          perform engine analysis and, if you use it, learning insights. We do
          not require an account or personal identifiers to use the service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          How we use and store data
        </h2>
        <p className="mt-2 text-zinc-400">
          Game data is used solely to run Stockfish analysis and, when
          requested, to generate learning insights. We do not sell your data.
          Logs and temporary processing may retain portions of requests for
          operational and security purposes; retention periods depend on our
          hosting and legal requirements.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">Contact</h2>
        <p className="mt-2 text-zinc-400">
          For privacy-related questions, please use the{" "}
          <Link to="/support" className="text-amber-400 hover:underline">
            Support
          </Link>{" "}
          page or contact the operators of this service.
        </p>
      </section>
    </div>
  );
}
