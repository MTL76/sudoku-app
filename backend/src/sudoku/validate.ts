export type SudokuGrid = number[][];

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const isFilledValue = (value: number): boolean => value >= 1 && value <= 9;

const findDuplicates = (values: number[]): number[] => {
  const counts = new Map<number, number>();
  for (const value of values) {
    if (!isFilledValue(value)) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
};

export function validateGrid(grid: SudokuGrid): ValidationResult {
  const errors: string[] = [];

  if (grid.length !== 9 || grid.some((row) => row.length !== 9)) {
    return {
      valid: false,
      errors: ["Grid must be 9x9"],
    };
  }

  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const duplicates = findDuplicates(grid[rowIndex]);
    for (const value of duplicates) {
      errors.push(`Duplicate value ${value} in row ${rowIndex + 1}`);
    }
  }

  for (let colIndex = 0; colIndex < 9; colIndex++) {
    const column = grid.map((row) => row[colIndex]);
    const duplicates = findDuplicates(column);
    for (const value of duplicates) {
      errors.push(`Duplicate value ${value} in column ${colIndex + 1}`);
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const box: number[] = [];
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
          box.push(grid[row][col]);
        }
      }
      const duplicates = findDuplicates(box);
      for (const value of duplicates) {
        errors.push(
          `Duplicate value ${value} in box (${boxRow + 1}, ${boxCol + 1})`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
