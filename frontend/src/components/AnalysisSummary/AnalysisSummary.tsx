import bestIcon from "../../assets/best.png";
import excellentIcon from "../../assets/excellent.png";
import goodIcon from "../../assets/good.png";
import inaccuracyIcon from "../../assets/innacuracy.png";
import mistakeIcon from "../../assets/mistake.png";
import blunderIcon from "../../assets/blunder.png";

type AnalysisPly = {
  grade: string;
  centipawnLoss: number;
};

type Props = {
  plies: AnalysisPly[] | null;
  playerNames: { white: string; black: string };
};

const gradeConfig: Record<
  string,
  { icon: string; label: string; order: number; color: string }
> = {
  Best: { icon: bestIcon, label: "Best", order: 0, color: "rgb(152, 188, 73)" },
  Excellent: { icon: excellentIcon, label: "Excellent", order: 1, color: "rgb(152, 188, 73)" },
  Good: { icon: goodIcon, label: "Good", order: 2, color: "rgb(151, 175, 139)" },
  Inaccuracy: { icon: inaccuracyIcon, label: "Inaccuracy", order: 3, color: "rgb(244, 191, 68)" },
  Mistake: { icon: mistakeIcon, label: "Mistake", order: 4, color: "rgb(226, 140, 40)" },
  Blunder: { icon: blunderIcon, label: "Blunder", order: 5, color: "rgb(201, 50, 48)" },
};

export default function AnalysisSummary({ plies, playerNames }: Props) {
  if (!plies || plies.length === 0) {
    return null;
  }

  // Count moves per grade for White (even indices: 0, 2, 4...) and Black (odd: 1, 3, 5...)
  const whiteCounts: Record<string, number> = {};
  const blackCounts: Record<string, number> = {};

  plies.forEach((ply, idx) => {
    const isWhite = idx % 2 === 0;
    const counts = isWhite ? whiteCounts : blackCounts;
    counts[ply.grade] = (counts[ply.grade] || 0) + 1;
  });

  // Get sorted grades (Best -> Blunder)
  const grades = Object.keys(gradeConfig).sort(
    (a, b) => gradeConfig[a].order - gradeConfig[b].order
  );

  return (
    <div className="mt-3 border border-gray-300 rounded-md bg-white shadow-sm">
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-800 mb-1">Analysis Summary</div>
        <table className="w-full">
          <tbody>
            <tr className="text-xs text-gray-600">
              <td className="w-32 pr-3"></td>
              <td className="w-16 text-center pr-2">{playerNames.white}</td>
              <td className="w-10"></td>
              <td className="w-16 text-center pl-2">{playerNames.black}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-3 py-3">
        <table className="w-full text-sm">
          <tbody>
            {grades.map((grade) => {
              const config = gradeConfig[grade];
              const whiteCount = whiteCounts[grade] || 0;
              const blackCount = blackCounts[grade] || 0;
              
              // Skip rows with zero counts for both players
              if (whiteCount === 0 && blackCount === 0) return null;

              return (
                <tr key={grade} className="border-b border-gray-100 last:border-0">
                  {/* Category Name */}
                  <td className="py-2.5 pr-3 w-32">
                    <span 
                      className="font-semibold text-sm"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                  </td>
                  
                  {/* White Player Count */}
                  <td className="py-2.5 text-center pr-2 w-16">
                    {whiteCount > 0 && (
                      <span 
                        className="font-bold text-base"
                        style={{ color: config.color }}
                      >
                        {whiteCount}
                      </span>
                    )}
                  </td>
                  
                  {/* Icon */}
                  <td className="py-2.5 text-center w-10">
                    <img src={config.icon} alt={config.label} className="w-5 h-5 inline-block" />
                  </td>
                  
                  {/* Black Player Count */}
                  <td className="py-2.5 text-center pl-2 w-16">
                    {blackCount > 0 && (
                      <span 
                        className="font-bold text-base"
                        style={{ color: config.color }}
                      >
                        {blackCount}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

