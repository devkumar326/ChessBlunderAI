import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-100">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">Acceptance</h2>
        <p className="mt-2 text-zinc-400">
          By using ChessBlunder AI, you agree to these terms. If you do not
          agree, please do not use the service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">Use of the service</h2>
        <p className="mt-2 text-zinc-400">
          The service is provided for personal, non-commercial analysis of chess
          games. You may not use it to violate any law, abuse other users, or
          overload our systems. You retain responsibility for the PGN content
          you submit.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">
          Disclaimers and limitations
        </h2>
        <p className="mt-2 text-zinc-400">
          Analysis and learning insights are provided &quot;as is&quot; and for
          educational use. We do not guarantee accuracy, availability, or
          fitness for a particular purpose. We are not liable for any decisions
          or outcomes based on the use of this service.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-200">Changes</h2>
        <p className="mt-2 text-zinc-400">
          We may update these terms from time to time. Continued use after
          changes constitutes acceptance. For questions, see{" "}
          <Link to="/support" className="text-amber-400 hover:underline">
            Support
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
