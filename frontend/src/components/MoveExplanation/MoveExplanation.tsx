import inaccuracyIcon from "../../assets/inaccuracy.png";
import mistakeIcon from "../../assets/mistake.png";
import blunderIcon from "../../assets/blunder.png";

type Props = {
  grade: string;
  reason: string;
  san: string;
  moveNumber: number;
  isWhite: boolean;
};

const gradeIcons: Record<string, string> = {
  Inaccuracy: inaccuracyIcon,
  Mistake: mistakeIcon,
  Blunder: blunderIcon,
};

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  Inaccuracy: {
    bg: "bg-yellow-50",
    text: "text-yellow-900",
    border: "border-yellow-200",
  },
  Mistake: {
    bg: "bg-orange-50",
    text: "text-orange-900",
    border: "border-orange-200",
  },
  Blunder: {
    bg: "bg-red-50",
    text: "text-red-900",
    border: "border-red-200",
  },
};

export default function MoveExplanation({ grade, reason, san, moveNumber, isWhite }: Props) {
  const icon = gradeIcons[grade];
  const colors = gradeColors[grade] || gradeColors.Mistake;
  const moveNotation = isWhite ? `${moveNumber}. ${san}` : `${moveNumber}... ${san}`;

  return (
    <div className={`mt-3 border ${colors.border} rounded-md ${colors.bg} shadow-sm`}>
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          {icon && (
            <img
              src={icon}
              alt={grade}
              className="w-7 h-7 flex-shrink-0 mt-0.5"
            />
          )}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-sm font-bold ${colors.text}`}>
                {grade}
              </span>
              <span className="text-xs font-mono text-gray-600">
                {moveNotation}
              </span>
            </div>
            <div className={`text-sm ${colors.text}`}>
              {reason}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

