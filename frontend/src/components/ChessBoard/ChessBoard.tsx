import { Chess } from "chess.js";
import { useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import inaccuracyIcon from "../../assets/inaccuracy.png";
import mistakeIcon from "../../assets/mistake.png";
import blunderIcon from "../../assets/blunder.png";

type MoveAnnotation = {
  grade: string;
  centipawnLoss: number;
  reason?: string;
  uci: string;
};

const ChessBoard = ({
  playerColor,
  playerNames,
  positionFen,
  isInteractive = true,
  currentMoveAnnotation,
}: {
  playerColor: "white" | "black";
  playerNames: { white: string; black: string } | null;
  positionFen?: string;
  isInteractive?: boolean;
  currentMoveAnnotation?: MoveAnnotation | null;
}) => {
  // create a chess game using a ref to always have access to the latest game state within closures and maintain the game state across renders
  const chessGameRef = useRef(new Chess());
  const chessGame = chessGameRef.current;

  // track the current position of the chess game in state to trigger a re-render of the chessboard
  const [chessPosition, setChessPosition] = useState(chessGame.fen());

  // make a random "CPU" move
  function makeRandomMove() {
    // get all possible moves`
    const possibleMoves = chessGame.moves();

    // exit if the game is over
    if (chessGame.isGameOver()) {
      return;
    }

    // pick a random move
    const randomMove =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    // make the move
    chessGame.move(randomMove);

    // update the position state
    setChessPosition(chessGame.fen());
  }

  // handle piece drop
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!isInteractive) {
      return false;
    }
    // type narrow targetSquare potentially being null (e.g. if dropped off board)
    if (!targetSquare) {
      return false;
    }

    // try to make the move according to chess.js logic
    try {
      chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });

      // update the position state upon successful move to trigger a re-render of the chessboard
      setChessPosition(chessGame.fen());

      // make random cpu move after a short delay
      setTimeout(makeRandomMove, 500);

      // return true as the move was successful
      return true;
    } catch {
      // return false as the move was not successful
      return false;
    }
  }

  // Get the destination square from UCI notation
  const getDestinationSquare = (uci: string): string | null => {
    if (!uci || uci.length < 4) return null;
    // UCI format is like "e2e4", destination is the last 2 characters
    return uci.slice(2, 4);
  };

  // Determine which icon to show based on grade
  const getGradeIcon = (grade: string): string | null => {
    const gradeIcons: Record<string, string> = {
      Inaccuracy: inaccuracyIcon,
      Mistake: mistakeIcon,
      Blunder: blunderIcon,
    };
    return gradeIcons[grade] || null;
  };

  // Get the square to annotate
  const annotationSquare = currentMoveAnnotation?.uci 
    ? getDestinationSquare(currentMoveAnnotation.uci)
    : null;
  const gradeIcon = currentMoveAnnotation?.grade 
    ? getGradeIcon(currentMoveAnnotation.grade)
    : null;

  // Custom square styles to highlight annotated squares
  const customSquareStyles = annotationSquare && gradeIcon
    ? {
        [annotationSquare]: {
          boxShadow: "inset 0 0 0 3px rgba(201, 50, 48, 0.6)",
        },
      }
    : {};

  // Convert square notation to board coordinates
  const getSquarePosition = (square: string): { file: number; rank: number } | null => {
    if (!square || square.length !== 2) return null;
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7 (a-h)
    const rank = parseInt(square[1]) - 1; // 0-7 (1-8)
    return { file, rank };
  };

  // Calculate position for the annotation icon overlay
  const getAnnotationPosition = (): { top: string; left: string } | null => {
    if (!annotationSquare) return null;
    const pos = getSquarePosition(annotationSquare);
    if (!pos) return null;

    // Calculate position based on board orientation
    let fileIndex = pos.file;
    let rankIndex = 7 - pos.rank; // Flip rank (board starts from rank 8)

    if (playerColor === "black") {
      // Flip both axes when viewing as black
      fileIndex = 7 - fileIndex;
      rankIndex = 7 - rankIndex;
    }

    // Position as percentage (each square is 12.5% of board)
    const left = `${fileIndex * 12.5}%`;
    const top = `${rankIndex * 12.5}%`;

    return { top, left };
  };

  const annotationPosition = getAnnotationPosition();
  const tooltipText = currentMoveAnnotation?.reason 
    ? `${currentMoveAnnotation.grade}: ${currentMoveAnnotation.reason}`
    : currentMoveAnnotation?.grade || "";

  // set the chessboard options
  const chessboardOptions = {
    position: positionFen ?? chessPosition,
    onPieceDrop,
    arePiecesDraggable: isInteractive,
    boardStyle: {
      border: "1px solid #000",
      borderRadius: "4px",
      boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.3)",
    },
    darkSquareStyle: {
      backgroundColor: "#779952",
    },
    lightSquareStyle: {
      backgroundColor: "#eeeed2",
    },
    boardOrientation: playerColor === "black" ? "black" as const : "white" as const,
    id: "play-vs-random" as const,
    customSquareStyles,
  };

  const names = playerNames ?? { white: "White", black: "Black" };
  // Bottom label should always be the player whose color matches the board orientation.
  const bottomName = playerColor === "white" ? names.white : names.black;
  const topName = playerColor === "white" ? names.black : names.white;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative top-0 left-0 inline-flex w-fit px-4 py-2 border border-grey-300 rounded-t-lg bg-[#1f2125] text-white text-center">
        {topName}
      </div>
      <div style={{ position: "relative" }}>
        <Chessboard options={chessboardOptions} />
        {annotationPosition && gradeIcon && (
          <div
            style={{
              position: "absolute",
              top: annotationPosition.top,
              left: annotationPosition.left,
              width: "12.5%",
              height: "12.5%",
              pointerEvents: "none",
              zIndex: 100,
            }}
          >
            <img
              src={gradeIcon}
              alt={currentMoveAnnotation?.grade || "annotation"}
              style={{
                position: "absolute",
                top: "-17%",
                right: "-17%",
                width: "35%",
                height: "35%",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7))",
                pointerEvents: "auto",
                cursor: "help",
              }}
              title={tooltipText}
            />
          </div>
        )}
      </div>
      <div className="relative bottom-0 right-0 inline-flex w-fit px-4 py-2 border border-grey-300 rounded-b-lg bg-[#1f2125] text-white text-center">
        {bottomName}
      </div>
    </div>
  );
};

export default ChessBoard;
