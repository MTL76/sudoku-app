import { describe, it, expect } from "vitest";
import * as sudoku from "../sudoku/validate";

describe("validateGrid", () => {
  it("returns valid for empty grid", () => {
    const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
    const result = sudoku.validateGrid(empty);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("detects duplicate in row", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 1;
    grid[0][1] = 1;

    const result = sudoku.validateGrid(grid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
