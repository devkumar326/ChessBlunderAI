import { useCallback, useRef } from "react";
import captureSfx from "../assets/audios/capture.webm";
import castleSfx from "../assets/audios/castle.webm";
import gameEndSfx from "../assets/audios/game-end.webm";
import moveCheckSfx from "../assets/audios/move-check.webm";
import moveOpponentSfx from "../assets/audios/move-opponent.webm";
import moveSelfSfx from "../assets/audios/move-self.webm";
import promoteSfx from "../assets/audios/promote.webm";

type MoveType = "capture" | "castle" | "check" | "promote" | "self" | "opponent" | "game-end";

export function useChessAudio() {
  // Pre-create Audio objects for all sounds
  const audioRefs = useRef({
    capture: new Audio(captureSfx),
    castle: new Audio(castleSfx),
    "game-end": new Audio(gameEndSfx),
    check: new Audio(moveCheckSfx),
    opponent: new Audio(moveOpponentSfx),
    self: new Audio(moveSelfSfx),
    promote: new Audio(promoteSfx),
  });

  const playSound = useCallback((moveType: MoveType) => {
    const audio = audioRefs.current[moveType];
    if (!audio) return;

    // Reset and play
    audio.currentTime = 0;
    audio.play().catch((err) => {
      // Ignore errors (e.g., user hasn't interacted with page yet)
      console.debug("Audio play failed:", err);
    });
  }, []);

  return { playSound };
}

