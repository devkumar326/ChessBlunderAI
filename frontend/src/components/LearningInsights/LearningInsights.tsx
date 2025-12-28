import { useState, type ReactNode } from "react";
import { getLearningInsights, type LearningInsights as LearningInsightsType, type AnalysisPly } from "../../api/analyze.api";

type Props = {
  plies: AnalysisPly[];
  playerColor: "white" | "black";
  headers?: Record<string, string>;
  insights: LearningInsightsType | null;
  onInsights: (data: LearningInsightsType) => void;
};

export default function LearningInsights({ plies, playerColor, headers, insights, onInsights }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    if (insights) return; // Already have insights for this game/color
    setIsLoading(true);
    setError(null);
    try {
      const result = await getLearningInsights(plies, playerColor, headers);
      if (result.ok) {
        onInsights(result.data);
      } else {
        setError("Failed to generate insights. Please try again.");
      }
    } catch (err: any) {
      console.error("Error generating insights:", err);
      setError(err.response?.data?.detail || "Failed to generate insights. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse inline markdown (bold text)
  const parseInlineMarkdown = (text: string): ReactNode => {
    const parts: (string | ReactNode)[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add the bold part
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const formatInsights = (text: string) => {
    // Split by common markdown patterns and format nicely
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers (## or **Title**)
      if (line.startsWith('##')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-gray-800 mt-4 mb-2">
            {line.replace(/^##\s*/, '')}
          </h3>
        );
      }
      if (line.match(/^\*\*[^*]+\*\*:/)) {
        const title = line.match(/\*\*([^*]+)\*\*/)?.[1];
        const rest = line.replace(/^\*\*[^*]+\*\*:\s*/, '');
        return (
          <div key={idx} className="mt-3">
            <span className="font-semibold text-gray-800">{title}:</span>
            <span className="text-gray-700"> {parseInlineMarkdown(rest)}</span>
          </div>
        );
      }
      // List items
      if (line.match(/^[\d]+\.\s/)) {
        const content = line.replace(/^[\d]+\.\s*/, '');
        return (
          <li key={idx} className="ml-4 text-gray-700 mb-1">
            {parseInlineMarkdown(content)}
          </li>
        );
      }
      if (line.match(/^[-*]\s/)) {
        const content = line.replace(/^[-*]\s*/, '');
        return (
          <li key={idx} className="ml-4 text-gray-700 mb-1 list-disc">
            {parseInlineMarkdown(content)}
          </li>
        );
      }
      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={idx} className="text-gray-700 mb-2">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="border border-gray-300 rounded-md bg-white shadow-sm p-4">
      <div className="text-lg font-bold text-gray-800 mb-2">
        What You Can Learn
      </div>
      <div className="text-sm text-gray-600 mb-4">
        Get AI-powered insights on your mistakes and how to improve your game.
      </div>

      {!insights && !isLoading && (
        <button
          onClick={handleGenerateInsights}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 shadow-sm"
        >
          Generate Learning Insights ✨
        </button>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <div className="text-sm text-gray-600">Analyzing your game with AI...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {insights && (
        <div className="mt-4">
          {/* Error Count Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">Your Error Summary:</div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-semibold text-red-600">{insights.errorCount.blunders}</span>
                <span className="text-gray-600 ml-1">Blunders</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-orange-600">{insights.errorCount.mistakes}</span>
                <span className="text-gray-600 ml-1">Mistakes</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-yellow-600">{insights.errorCount.inaccuracies}</span>
                <span className="text-gray-600 ml-1">Inaccuracies</span>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="prose prose-sm max-w-none">
            {formatInsights(insights.insights)}
          </div>
        </div>
      )}
    </div>
  );
}

