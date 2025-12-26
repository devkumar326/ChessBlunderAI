type Props = {
  moves: string[];
  moveIndex: number; // ply index: 0=start, 1=after white's first move, 2=after black's first move, ...
  onJumpToPly: (plyIndex: number) => void;
};

export default function MoveHistory({ moves, moveIndex, onJumpToPly }: Props) {
  const activePly = Math.max(0, moveIndex - 1); // highlight last played move

  const rows: Array<{ moveNo: number; white?: string; black?: string; whitePly?: number; blackPly?: number }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      moveNo: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
      whitePly: i,
      blackPly: i + 1,
    });
  }

  return (
    <div className="mt-3 border border-gray-300 rounded-md bg-white">
      <div className="px-3 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">
        Move history
      </div>
      <div className="max-h-64 overflow-auto px-3 py-2 text-sm">
        {rows.length === 0 ? (
          <div className="text-gray-600">No moves loaded.</div>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => (
              <div key={r.moveNo} className="flex items-start gap-2">
                <div className="w-7 text-gray-500 select-none">{r.moveNo}.</div>
                <button
                  type="button"
                  title={`Jump to ${r.moveNo}. ${r.white ?? ""}`.trim()}
                  onClick={() => onJumpToPly((r.whitePly ?? 0) + 1)}
                  disabled={!r.white}
                  className={[
                    "px-2 py-0.5 rounded-md text-left",
                    "hover:bg-gray-100 disabled:opacity-50",
                    r.whitePly === activePly ? "bg-yellow-200" : "",
                  ].join(" ")}
                >
                  {r.white ?? "—"}
                </button>
                <button
                  type="button"
                  title={
                    r.black ? `Jump to ${r.moveNo}... ${r.black}` : "No black move"
                  }
                  onClick={() => onJumpToPly((r.blackPly ?? 0) + 1)}
                  disabled={!r.black}
                  className={[
                    "px-2 py-0.5 rounded-md text-left",
                    "hover:bg-gray-100 disabled:opacity-50",
                    r.blackPly === activePly ? "bg-yellow-200" : "",
                  ].join(" ")}
                >
                  {r.black ?? "—"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


