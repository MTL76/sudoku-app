import puzzles from "./puzzles.json";
import { validateGrid, type SudokuGrid } from "./validate";

export type UIDifficulty = "easy" | "intermediate" | "hard";
export type SourceDifficulty = "easy" | "intermediate" | "difficult" | "expert";

export type PuzzleEntry = {
  puzzleId: string;
  difficulty: SourceDifficulty;
  grid: SudokuGrid;
  solution: SudokuGrid;
};

type PuzzleBank = Record<SourceDifficulty, PuzzleEntry[]>;

const puzzleBank = puzzles as PuzzleBank;

const sourceDifficulties: SourceDifficulty[] = [
  "easy",
  "intermediate",
  "difficult",
  "expert",
];

const uiDifficulties: UIDifficulty[] = ["easy", "intermediate", "hard"];

export function parseUiDifficulty(value: unknown): UIDifficulty | null {
  if (typeof value !== "string") return null;
  return uiDifficulties.includes(value as UIDifficulty)
    ? (value as UIDifficulty)
    : null;
}

export function mapUiToSourceDifficulty(
  difficulty: UIDifficulty,
): SourceDifficulty {
  if (difficulty === "easy") return "intermediate";
  if (difficulty === "intermediate") return "difficult";
  return "expert";
}

export function getRandomPuzzle(sourceDifficulty: SourceDifficulty): PuzzleEntry {
  const puzzles = puzzleBank[sourceDifficulty];
  if (!puzzles || puzzles.length === 0) {
    throw new Error(`No puzzles configured for source ${sourceDifficulty}`);
  }

  const index = Math.floor(Math.random() * puzzles.length);
  return puzzles[index];
}

export function getPuzzleById(puzzleId: string): PuzzleEntry | undefined {
  for (const difficulty of sourceDifficulties) {
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
