import express from "express";
import type { RequestHandler } from "express";
import {
  getPuzzleById,
  getRandomPuzzle,
  isGridSolved,
  mapUiToSourceDifficulty,
  parseUiDifficulty,
  type UIDifficulty,
} from "./sudoku/puzzle-bank";
import { validateGrid, type SudokuGrid } from "./sudoku/validate";

// This file defines the Express application object and route handlers.
// Think of this like a Pascal unit interface that exposes callable routines.
// The server startup is kept in index.ts so tests can call handlers directly.
export const app = express();

app.use(express.json());

// A RequestHandler is a function that receives request and response objects.
// It reads input, applies domain logic, and writes an HTTP response.
export const healthHandler: RequestHandler = (_req, res) => {
  res.json({ ok: true });
};

// The backend is stateless for game progress.
// Each request carries all data needed for validation or solved checks.
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
  const rawDifficulty = req.query.difficulty;
  const parsedDifficulty =
    rawDifficulty == null ? "intermediate" : parseUiDifficulty(rawDifficulty);

  if (!parsedDifficulty) {
    res.status(400).json({
      error: "difficulty query must be one of easy intermediate hard",
    });
    return;
  }

  const difficulty: UIDifficulty = parsedDifficulty;
  const sourceDifficulty = mapUiToSourceDifficulty(difficulty);

  let puzzle;
  try {
    puzzle = getRandomPuzzle(sourceDifficulty);
  } catch (_error) {
    res.status(500).json({
      error: `no puzzles available for source difficulty ${sourceDifficulty}`,
    });
    return;
  }

  res.json({
    puzzleId: puzzle.puzzleId,
    difficulty,
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

// Route table for the app unit.
app.get("/health", healthHandler);
app.get("/api/puzzle", puzzleHandler);
app.post("/api/validate", validateHandler);
app.post("/api/check-solved", checkSolvedHandler);
