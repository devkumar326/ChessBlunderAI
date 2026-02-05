export default function Support() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-100">Support</h1>
      <p className="mt-4 text-zinc-400">
        Get help with ChessBlunder AI and report issues.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-zinc-200">
          Common issues
        </h2>
        <p className="mt-2 text-zinc-400">
          If analysis fails or times out, check that your PGN is valid and not
          excessively long. Very long games or slow connections can cause
          timeouts. Try a shorter game or the sample PGN to confirm the service
          is working.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Where to get a PGN
        </h2>
        <p className="mt-2 text-zinc-400">
          You can export PGN from Lichess, Chess.com, and most chess apps. Look
          for &quot;Export game&quot; or &quot;Download PGN&quot; in the game
          or analysis view. Paste the full output into our PGN input and click
          Analyze.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">Contact</h2>
        <p className="mt-2 text-zinc-400">
          For bugs, feature ideas, or privacy/terms questions, please reach out
          to the maintainers of this project through the repository or contact
          channel listed in the project README.
        </p>
      </section>
    </div>
  );
}
