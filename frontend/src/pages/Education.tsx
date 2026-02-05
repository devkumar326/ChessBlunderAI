export default function Education() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-100">Education</h1>
      <p className="mt-4 text-zinc-400">
        Use our analysis and insights to study your games and improve.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-200">
          How to read the grades
        </h2>
        <p className="mt-2 text-zinc-400">
          Moves are graded from &quot;Best&quot; (engine choice or near equal)
          down to &quot;Blunder&quot; (large centipawn loss). Inaccuracies,
          mistakes, and blunders are the ones most worth reviewing. Click
          through your game and focus on those moves first.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Using the Analysis and History tabs
        </h2>
        <p className="mt-2 text-zinc-400">
          The Analysis tab summarizes the game and highlights key inaccuracies,
          mistakes, and blunders. The History tab lists every move with its
          grade and evaluation—click a move to jump the board to that position.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Making the most of Learning insights
        </h2>
        <p className="mt-2 text-zinc-400">
          After you pick your color, open the Learning tab to see AI-generated
          insights. These are based on your errors and the game context. Use
          them to identify recurring themes and set practice goals.
        </p>
      </section>
    </div>
  );
}
