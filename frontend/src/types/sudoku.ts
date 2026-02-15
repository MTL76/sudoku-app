export type Grid = number[][];

export type Difficulty = "easy" | "medium" | "hard";

export type PuzzleResponse = {
  puzzleId: string;
  difficulty: Difficulty;
  grid: Grid;
  solution?: Grid;
};

export type ValidateRequest = {
  grid: Grid;
};

export type ValidateError = {
  row: number;
  col: number;
  reason: "row" | "col" | "box";
};

export type ValidateResponse = {
  valid: boolean;
  errors: ValidateError[];
};
