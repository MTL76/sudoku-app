export type Grid = number[][];

export type Difficulty = "easy" | "intermediate" | "difficult" | "expert";

export type PuzzleResponse = {
  puzzleId: string;
  difficulty: Difficulty;
  grid: Grid;
};

export type ValidateRequest = {
  grid: Grid;
};

export type ValidateError = {
  row: number;
  col: number;
  reason: "row" | "column" | "box" | "shape";
  message: string;
};

export type ValidateResponse = {
  valid: boolean;
  errors: ValidateError[];
};

export type CheckSolvedRequest = {
  puzzleId: string;
  grid: Grid;
};

export type CheckSolvedResponse = {
  solved: boolean;
  valid: boolean;
};

export type Point = {
  row: number;
  col: number;
};
