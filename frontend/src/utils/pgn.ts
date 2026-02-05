/**
 * Sample PGN for "Try Sample PGN" and demos.
 * Realistic game with headers and multiple moves.
 */
export const SAMPLE_PGN = `[Event "Rated Blitz game"]
[Site "https://lichess.org/abc123"]
[Date "2024.01.15"]
[White "matheoangelo"]
[Black "chessfan99"]
[Result "1-0"]
[WhiteElo "1650"]
[BlackElo "1620"]
[TimeControl "180+2"]
[ECO "C42"]

1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Bd6 7. O-O O-O 8. c4 c6 9. Nc3 Nxc3 10. bxc3 Bg4 11. Rb1 b6 12. cxd5 cxd5 13. h3 Bh5 14. g4 Bg6 15. Ne5 Nc6 16. Nxg6 hxg6 17. Bb2 Rc8 18. Rc1 Na5 19. c4 dxc4 20. Bxc4 Nxc4 21. Rxc4 Rxc4 22. Bxc4 Qd5 23. Qe2 Rc8 24. Bd3 Qxa2 25. Rc1 Rxc1+ 26. Bxc1 Qe6 27. Qb2 b5 28. Bb2 a5 29. Kg2 a4 30. Qc3 Qd5+ 31. f3 a3 32. Bc1 Qe6 33. Qa5 Bb8 34. Qb6 Bd6 35. Qb7 g5 36. Qd7 1-0`;

export function extractPgnTagValue(pgn: string, tagName: string): string | null {
  const re = new RegExp(`\\[${tagName}\\s+"([^"]*)"\\]`, "m");
  const match = pgn.match(re);
  const value = match?.[1]?.trim();
  return value ?? null;
}

export function getPlayerNamesFromPgn(pgn: string): { white: string; black: string } {
  return {
    white: extractPgnTagValue(pgn, "White") ?? "White",
    black: extractPgnTagValue(pgn, "Black") ?? "Black",
  };
}
