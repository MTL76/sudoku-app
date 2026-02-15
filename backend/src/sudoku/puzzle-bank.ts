import puzzles from "./puzzles.json";
import { validateGrid, type SudokuGrid } from "./validate";

export type Difficulty = "easy" | "intermediate" | "difficult" | "expert";

export type PuzzleEntry = {
  puzzleId: string;
  difficulty: Difficulty;
  grid: SudokuGrid;
  solution: SudokuGrid;
};

type PuzzleBank = Record<Difficulty, PuzzleEntry[]>;

const puzzleBank = puzzles as PuzzleBank;

const difficulties: Difficulty[] = [
  "easy",
  "intermediate",
  "difficult",
  "expert",
];

export function parseDifficulty(value: unknown): Difficulty | null {
  if (typeof value !== "string") return null;
  return difficulties.includes(value as Difficulty) ? (value as Difficulty) : null;
}

export function getRandomPuzzle(difficulty: Difficulty): PuzzleEntry {
  const bucket = puzzleBank[difficulty];
  if (!bucket || bucket.length === 0) {
    throw new Error(`No puzzles configured for difficulty ${difficulty}`);
  }

  const index = Math.floor(Math.random() * bucket.length);
  return bucket[index];
}

export function getPuzzleById(puzzleId: string): PuzzleEntry | undefined {
  for (const difficulty of difficulties) {
    const match = puzzleBank[difficulty].find((item) => item.puzzleId === puzzleId);
    if (match) return match;
  }
  return undefined;
}

export function isGridComplete(grid: SudokuGrid): boolean {
  return grid.every((row) => row.every((value) => value >= 1 && value <= 9));
}

export function isGridSolved(
  puzzle: PuzzleEntry,
  candidate: SudokuGrid,
): { solved: boolean; valid: boolean } {
  const validation = validateGrid(candidate);
  const valid = validation.valid;
  if (!valid || !isGridComplete(candidate)) {
    return { solved: false, valid };
  }

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (candidate[row][col] !== puzzle.solution[row][col]) {
        return { solved: false, valid };
      }
    }
  }

  return { solved: true, valid };
}
