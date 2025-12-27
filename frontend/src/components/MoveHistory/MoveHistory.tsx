import bestIcon from "../../assets/best.png";
import excellentIcon from "../../assets/excellent.png";
import goodIcon from "../../assets/good.png";
import inaccuracyIcon from "../../assets/inaccuracy.png";
import mistakeIcon from "../../assets/mistake.png";
import blunderIcon from "../../assets/blunder.png";

type Props = {
  moves: string[];
  moveIndex: number; // ply index: 0=start, 1=after white's first move, 2=after black's first move, ...
  onJumpToPly: (plyIndex: number) => void;
  moveMeta?: Array<{ grade: string; centipawnLoss: number; reason?: string }> | null;
};

export default function MoveHistory({ moves, moveIndex, onJumpToPly, moveMeta }: Props) {
  const activePly = Math.max(0, moveIndex - 1); // highlight last played move

  const gradeIcons: Record<string, string> = {
    Best: bestIcon,
    Excellent: excellentIcon,
    Good: goodIcon,
    Inaccuracy: inaccuracyIcon,
    Mistake: mistakeIcon,
    Blunder: blunderIcon,
  };

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
    <div className="border border-gray-300 rounded-md bg-white">
      <div className="px-3 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">
        Move history
      </div>
      <div className="max-h-80 overflow-auto px-3 py-2 text-sm">
        {rows.length === 0 ? (
          <div className="text-gray-600">No moves loaded.</div>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => (
              <div key={r.moveNo} className="flex items-start gap-2">
                <div className="w-7 text-gray-500 select-none">{r.moveNo}.</div>
                <button
                  type="button"
                  title={
                    r.whitePly != null && moveMeta?.[r.whitePly]
                      ? `${r.moveNo}. ${r.white ?? ""} — ${moveMeta[r.whitePly].grade} (${moveMeta[r.whitePly].centipawnLoss} cp)${moveMeta[r.whitePly].reason ? `\n${moveMeta[r.whitePly].reason}` : ""}`
                      : `Jump to ${r.moveNo}. ${r.white ?? ""}`.trim()
                  }
                  onClick={() => onJumpToPly((r.whitePly ?? 0) + 1)}
                  disabled={!r.white}
                  className={[
                    "px-2 py-0.5 rounded-md text-left",
                    "hover:bg-gray-100 disabled:opacity-50",
                    r.whitePly === activePly ? "bg-yellow-200" : "",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{r.white ?? "—"}</span>
                    {r.whitePly != null && moveMeta?.[r.whitePly] ? (
                      <img
                        src={gradeIcons[moveMeta[r.whitePly].grade]}
                        alt={moveMeta[r.whitePly].grade}
                        className="w-4 h-4"
                      />
                    ) : null}
                  </span>
                </button>
                <button
                  type="button"
                  title={
                    r.blackPly != null && moveMeta?.[r.blackPly]
                      ? `${r.moveNo}... ${r.black} — ${moveMeta[r.blackPly].grade} (${moveMeta[r.blackPly].centipawnLoss} cp)${moveMeta[r.blackPly].reason ? `\n${moveMeta[r.blackPly].reason}` : ""}`
                      : r.black
                        ? `Jump to ${r.moveNo}... ${r.black}`
                        : "No black move"
                  }
                  onClick={() => onJumpToPly((r.blackPly ?? 0) + 1)}
                  disabled={!r.black}
                  className={[
                    "px-2 py-0.5 rounded-md text-left",
                    "hover:bg-gray-100 disabled:opacity-50",
                    r.blackPly === activePly ? "bg-yellow-200" : "",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{r.black ?? "—"}</span>
                    {r.blackPly != null && moveMeta?.[r.blackPly] ? (
                      <img
                        src={gradeIcons[moveMeta[r.blackPly].grade]}
                        alt={moveMeta[r.blackPly].grade}
                        className="w-4 h-4"
                      />
                    ) : null}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


