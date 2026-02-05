export default function Features() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-100">Features</h1>
      <p className="mt-4 text-zinc-400">
        ChessBlunder AI brings engine-grade analysis and learning tools to your
        games.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-200">
          Stockfish engine analysis
        </h2>
        <p className="mt-2 text-zinc-400">
          Every move is evaluated with a strong Stockfish backend. You get
          centipawn loss, best alternatives, and a clear grade (Best, Excellent,
          Good, Inaccuracy, Mistake, Blunder) so you know where you stood.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Move-by-move replay
        </h2>
        <p className="mt-2 text-zinc-400">
          Step through the game, auto-play, or jump to any move. The board
          updates in sync with the move list and evaluation, so you can focus on
          critical moments.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Learning insights
        </h2>
        <p className="mt-2 text-zinc-400">
          Get AI-generated learning insights tailored to your side and your
          mistakes. Summaries highlight patterns, opening choices, and concrete
          improvement ideas.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">PGN in, insight out</h2>
        <p className="mt-2 text-zinc-400">
          Paste any valid PGN—from Lichess, Chess.com, or your local file—and
          run a full analysis without creating an account. Your games stay on
          your side.
        </p>
      </section>
    </div>
  );
}
