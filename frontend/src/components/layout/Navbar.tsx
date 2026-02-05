import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"
        aria-label="Main"
      >
        <Link
          to="/"
          className="text-xl font-bold text-white hover:text-amber-400 transition-colors"
        >
          ChessBlunder AI
        </Link>
        <ul className="flex items-center gap-8">
          <li>
            <Link
              to="/analysis"
              className="text-xs font-medium uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
            >
              Analysis
            </Link>
          </li>
          <li>
            <Link
              to="/features"
              className="text-xs font-medium uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
            >
              Features
            </Link>
          </li>
          <li>
            <Link
              to="/education"
              className="text-xs font-medium uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
            >
              Education
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
