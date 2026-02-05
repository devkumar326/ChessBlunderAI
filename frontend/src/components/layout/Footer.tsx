import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs uppercase tracking-wider text-white">
            © {new Date().getFullYear()} ChessBlunder AI, All Rights Reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-6">
            <li>
              <Link
                to="/privacy"
                className="text-xs font-medium uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-xs font-medium uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                to="/support"
                className="text-xs font-medium uppercase tracking-wider text-white hover:text-amber-400 transition-colors"
              >
                Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
