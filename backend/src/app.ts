import express from "express";
import type { RequestHandler } from "express";
import {
  getPuzzleById,
  getRandomPuzzle,
  isGridSolved,
  parseDifficulty,
} from "./sudoku/puzzle-bank";
import { validateGrid, type SudokuGrid } from "./sudoku/validate";

export const app = express();

app.use(express.json());

export const healthHandler: RequestHandler = (_req, res) => {
  res.json({ ok: true });
};

const isValidGrid = (input: unknown): input is SudokuGrid => {
  if (!Array.isArray(input) || input.length !== 9) return false;
  return input.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every((value) => Number.isInteger(value) && value >= 0 && value <= 9),
  );
};

export const puzzleHandler: RequestHandler = (req, res) => {
  const difficulty = parseDifficulty(req.query.difficulty);
  if (!difficulty) {
    res.status(400).json({
      error:
        "difficulty query must be one of easy intermediate difficult expert",
    });
    return;
  }

  const puzzle = getRandomPuzzle(difficulty);
  res.json({
    puzzleId: puzzle.puzzleId,
    difficulty: puzzle.difficulty,
    grid: puzzle.grid,
  });
};

export const validateHandler: RequestHandler = (req, res) => {
  if (!isValidGrid(req.body?.grid)) {
    res.status(400).json({ error: "grid must be a 9x9 matrix with values 0 to 9" });
    return;
  }

  res.json(validateGrid(req.body.grid));
};

export const checkSolvedHandler: RequestHandler = (req, res) => {
  const { puzzleId, grid } = req.body ?? {};
  if (typeof puzzleId !== "string") {
    res.status(400).json({ error: "puzzleId is required" });
    return;
  }
  if (!isValidGrid(grid)) {
    res.status(400).json({ error: "grid must be a 9x9 matrix with values 0 to 9" });
    return;
  }

  const puzzle = getPuzzleById(puzzleId);
  if (!puzzle) {
    res.status(404).json({ error: "puzzle not found" });
    return;
  }

  const result = isGridSolved(puzzle, grid);
  res.json(result);
};

app.get("/health", healthHandler);
app.get("/api/puzzle", puzzleHandler);
app.post("/api/validate", validateHandler);
app.post("/api/check-solved", checkSolvedHandler);
