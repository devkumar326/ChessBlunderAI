import { Chess } from "chess.js";
import { useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";

const ChessBoard = ({
  playerColor,
  playerNames,
  positionFen,
  isInteractive = true,
}: {
  playerColor: "white" | "black";
  playerNames: { white: string; black: string } | null;
  positionFen?: string;
  isInteractive?: boolean;
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
      <Chessboard options={chessboardOptions} />
      <div className="relative bottom-0 right-0 inline-flex w-fit px-4 py-2 border border-grey-300 rounded-b-lg bg-[#1f2125] text-white text-center">
        {bottomName}
      </div>
    </div>
  );
};

export default ChessBoard;
