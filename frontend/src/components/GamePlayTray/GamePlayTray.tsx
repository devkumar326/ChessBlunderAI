import type { ReactNode } from "react";

type Props = {
  isPlaying: boolean;
  moveIndex: number;
  moveCount: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function IconButton({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-400 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
    >
      {children}
    </button>
  );
}

export default function GamePlayTray({
  isPlaying,
  moveIndex,
  moveCount,
  onTogglePlay,
  onPrev,
  onNext,
}: Props) {
  const atStart = moveIndex <= 0;
  const atEnd = moveIndex >= moveCount;
  const fullMove = Math.ceil(moveIndex / 2);
  const fullMoveCount = Math.ceil(moveCount / 2);

  return (
    <div className="flex items-center gap-3 mt-3">
      <IconButton title="Last move" onClick={onPrev} disabled={atStart}>
        {/* Previous icon */}
        <svg
          className="w-6 h-6 text-gray-800"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 6v12m8-12v12l-8-6 8-6Z"
          />
        </svg>
      </IconButton>

      <IconButton
        title={isPlaying ? "Pause" : "Play"}
        onClick={onTogglePlay}
        disabled={moveCount === 0}
      >
        {isPlaying ? (
          // Pause icon
          <svg
            className="w-6 h-6 text-gray-800"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 6H8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 0h-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z"
            />
          </svg>
        ) : (
          // Play icon
          <svg
            className="w-6 h-6 text-gray-800"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 18V6l8 6-8 6Z"
            />
          </svg>
        )}
      </IconButton>

      <IconButton title="Next move" onClick={onNext} disabled={atEnd}>
        {/* Next icon */}
        <svg
          className="w-6 h-6 text-gray-800"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 6v12M8 6v12l8-6-8-6Z"
          />
        </svg>
      </IconButton>

      <div className="text-sm text-gray-700 ml-2">
        Move {fullMove}/{fullMoveCount}
      </div>
    </div>
  );
}
