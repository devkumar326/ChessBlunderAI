import type { ReactNode } from "react";

type Props = {
  isPlaying: boolean;
  moveIndex: number;
  moveCount: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToStart?: () => void;
  onJumpToEnd?: () => void;
};

function IconButton({
  title,
  onClick,
  disabled,
  variant = "default",
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "primary";
  children: ReactNode;
}) {
  const baseClasses = "inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const variantClasses = variant === "primary"
    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:hover:bg-blue-600 disabled:shadow-md"
    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 disabled:hover:bg-white";

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
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
  onJumpToStart,
  onJumpToEnd,
}: Props) {
  const atStart = moveIndex <= 0;
  const atEnd = moveIndex >= moveCount;
  const fullMove = Math.ceil(moveIndex / 2);
  const fullMoveCount = Math.ceil(moveCount / 2);
  const progress = moveCount > 0 ? (moveIndex / moveCount) * 100 : 0;

  return (
    <div className="mt-4 border border-gray-300 rounded-lg bg-white p-4 shadow-sm">
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls and Counter */}
      <div className="flex items-center justify-between">
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {onJumpToStart && (
            <IconButton title="Jump to start" onClick={onJumpToStart} disabled={atStart}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </IconButton>
          )}

          <IconButton title="Previous move" onClick={onPrev} disabled={atStart}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </IconButton>

          <IconButton
            title={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
            disabled={moveCount === 0}
            variant="primary"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </IconButton>

          <IconButton title="Next move" onClick={onNext} disabled={atEnd}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </IconButton>

          {onJumpToEnd && (
            <IconButton title="Jump to end" onClick={onJumpToEnd} disabled={atEnd}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </IconButton>
          )}
        </div>

        {/* Move Counter */}
        <div className="flex items-center gap-2">
          {/* <div className="text-sm font-medium text-gray-500">Move</div> */}
          <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md">
            <span className="text-base font-bold text-gray-900">{fullMove}</span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-base font-semibold text-gray-600">{fullMoveCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
