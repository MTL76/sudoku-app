export type SudokuGrid = number[][];

export type ValidationReason = "row" | "column" | "box" | "shape";

export type ValidationError = {
  row: number;
  col: number;
  reason: ValidationReason;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

// Sudoku uses digits 1 to 9.
// Value 0 means empty and is ignored during conflict checks.
const isFilledValue = (value: number): boolean => value >= 1 && value <= 9;

// For one region, row column or box, group cells by value and report duplicates.
const pushDuplicateErrors = (
  errors: ValidationError[],
  positions: Array<{ row: number; col: number; value: number }>,
  reason: Exclude<ValidationReason, "shape">,
) => {
  const grouped = new Map<number, Array<{ row: number; col: number }>>();
  for (const item of positions) {
    const list = grouped.get(item.value) ?? [];
    list.push({ row: item.row, col: item.col });
    grouped.set(item.value, list);
  }

  for (const [value, cells] of grouped) {
    if (cells.length < 2) continue;
    for (const cell of cells) {
      errors.push({
        row: cell.row,
        col: cell.col,
        reason,
        message: `Duplicate value ${value} in ${reason}`,
      });
    }
  }
};

// Conceptual flow:
// 1) verify shape is 9x9
// 2) scan each row for duplicate digits
// 3) scan each column for duplicate digits
// 4) scan each 3x3 box for duplicate digits
// The function is pure and stateless so callers can safely run it any time.
export function validateGrid(grid: SudokuGrid): ValidationResult {
  const errors: ValidationError[] = [];

  if (grid.length !== 9 || grid.some((row) => row.length !== 9)) {
    errors.push({
      row: -1,
      col: -1,
      reason: "shape",
      message: "Grid must be 9x9",
    });
    return { valid: false, errors };
  }

  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const values = [];
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      const value = grid[rowIndex][colIndex];
      if (!isFilledValue(value)) continue;
      values.push({ row: rowIndex, col: colIndex, value });
    }
    pushDuplicateErrors(errors, values, "row");
  }

  for (let colIndex = 0; colIndex < 9; colIndex++) {
    const values = [];
    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      const value = grid[rowIndex][colIndex];
      if (!isFilledValue(value)) continue;
      values.push({ row: rowIndex, col: colIndex, value });
    }
    pushDuplicateErrors(errors, values, "column");
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const values = [];
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          const value = grid[row][col];
          if (!isFilledValue(value)) continue;
          values.push({ row, col, value });
        }
      }
      pushDuplicateErrors(errors, values, "box");
    }
  }

  return { valid: errors.length === 0, errors };
}
