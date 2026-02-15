import type { Grid, Point } from "../types/sudoku";

type SudokuGridProps = {
  grid: Grid;
  givens: Grid;
  notes: number[][][];
  selected: Point | null;
  conflicts: Set<string>;
  onSelect: (row: number, col: number) => void;
};

const keyFor = (row: number, col: number) => `${row}:${col}`;

// Helper for highlight logic inside one 3x3 region.
const isSameBox = (a: Point, b: Point) =>
  Math.floor(a.row / 3) === Math.floor(b.row / 3) &&
  Math.floor(a.col / 3) === Math.floor(b.col / 3);

// This component is a focused view unit.
// It receives state from App and emits user intent through onSelect.
export function SudokuGrid({
  grid,
  givens,
  notes,
  selected,
  conflicts,
  onSelect,
}: SudokuGridProps) {
  const selectedValue = selected ? grid[selected.row][selected.col] : 0;

  return (
    <section className="grid-wrap" aria-label="Sudoku grid">
      <div className="sudoku-grid" role="grid">
        {/* Render logic is pure from props, so rerender always reflects latest state. */}
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isGiven = givens[rowIndex][colIndex] !== 0;
            const isSelected =
              selected?.row === rowIndex && selected?.col === colIndex;
            const inSelectionZone =
              !!selected &&
              (selected.row === rowIndex ||
                selected.col === colIndex ||
                isSameBox(selected, { row: rowIndex, col: colIndex }));
            const sameValue =
              selectedValue > 0 &&
              value === selectedValue &&
              !isSelected &&
              !inSelectionZone;
            const hasConflict = conflicts.has(keyFor(rowIndex, colIndex));

            const classNames = ["cell"];
            if (isGiven) classNames.push("cell-given");
            if (!isGiven && value > 0) classNames.push("cell-user");
            if (inSelectionZone && !isSelected) classNames.push("cell-zone");
            if (sameValue) classNames.push("cell-same");
            if (isSelected) classNames.push("cell-selected");
            if (hasConflict) classNames.push("cell-conflict");
            if (rowIndex % 3 === 2) classNames.push("cell-row-edge");
            if (colIndex % 3 === 2) classNames.push("cell-col-edge");

            return (
              <button
                key={keyFor(rowIndex, colIndex)}
                type="button"
                role="gridcell"
                className={classNames.join(" ")}
                onClick={() => onSelect(rowIndex, colIndex)}
              >
                {value > 0 ? (
                  <span
                    className={`cell-value ${
                      isGiven ? "cell-value-given" : "cell-value-user"
                    }`}
                  >
                    {value}
                  </span>
                ) : (
                  <span className="notes-grid" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, noteIndex) => noteIndex + 1).map(
                      (noteValue) => (
                        <span key={noteValue} className="note-cell">
                          {notes[rowIndex][colIndex].includes(noteValue)
                            ? noteValue
                            : ""}
                        </span>
                      ),
                    )}
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>
    </section>
  );
}
