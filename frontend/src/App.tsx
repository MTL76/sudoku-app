import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkSolved, fetchPuzzle, validateGrid } from "./api/client";
import { NumberPad } from "./components/NumberPad";
import { SudokuGrid } from "./components/SudokuGrid";
import { TopBar } from "./components/TopBar";
import "./styles/app.css";
import type { Difficulty, Grid, Point } from "./types/sudoku";

type Snapshot = {
  grid: Grid;
  notes: number[][][];
};

type GameState = {
  puzzleId: string;
  givens: Grid;
  grid: Grid;
  notes: number[][][];
  undo: Snapshot[];
};

const createEmptyGrid = (): Grid =>
  Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

const createEmptyNotes = (): number[][][] =>
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [] as number[]),
  );

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row]);

const cloneNotes = (notes: number[][][]): number[][][] =>
  notes.map((row) => row.map((cell) => [...cell]));

const keyFor = (row: number, col: number) => `${row}:${col}`;

const gridFilled = (grid: Grid): boolean =>
  grid.every((row) => row.every((value) => value >= 1 && value <= 9));

const cleanupNotesForCompletedDigits = (
  grid: Grid,
  notes: number[][][],
): number[][][] => {
  const counts = Array.from({ length: 10 }, () => 0);
  for (const row of grid) {
    for (const value of row) {
      if (value >= 1 && value <= 9) counts[value] += 1;
    }
  }

  const completedDigits = new Set<number>();
  for (let digit = 1; digit <= 9; digit++) {
    if (counts[digit] === 9) completedDigits.add(digit);
  }

  if (completedDigits.size === 0) return notes;

  const nextNotes = cloneNotes(notes);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      nextNotes[row][col] = nextNotes[row][col].filter(
        (digit) => !completedDigits.has(digit),
      );
    }
  }

  return nextNotes;
};

const initialGameState: GameState = {
  puzzleId: "",
  givens: createEmptyGrid(),
  grid: createEmptyGrid(),
  notes: createEmptyNotes(),
  undo: [],
};

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [game, setGame] = useState<GameState>(initialGameState);
  const [selected, setSelected] = useState<Point | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [liveValidation, setLiveValidation] = useState(true);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState("Loading puzzle");
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);
  const validationRequestId = useRef(0);
  const completionRequestId = useRef(0);
  const lastAutoCheckGrid = useRef("");

  const loadPuzzle = useCallback(async (targetDifficulty: Difficulty) => {
    setLoadingPuzzle(true);
    setStatusMessage("Loading puzzle");
    setConflicts(new Set());

    try {
      const puzzle = await fetchPuzzle(targetDifficulty);
      setGame({
        puzzleId: puzzle.puzzleId,
        givens: cloneGrid(puzzle.grid),
        grid: cloneGrid(puzzle.grid),
        notes: createEmptyNotes(),
        undo: [],
      });
      setSelected(null);
      setStatusMessage("Puzzle ready");
      lastAutoCheckGrid.current = "";
    } catch (_error) {
      setStatusMessage("Could not load puzzle");
    } finally {
      setLoadingPuzzle(false);
    }
  }, []);

  useEffect(() => {
    void loadPuzzle(difficulty);
  }, [difficulty, loadPuzzle]);

  const runCheckSolved = useCallback(
    async (grid: Grid) => {
      if (!game.puzzleId) return;

      const requestId = completionRequestId.current + 1;
      completionRequestId.current = requestId;
      setStatusMessage("Checking puzzle");

      try {
        const result = await checkSolved({ puzzleId: game.puzzleId, grid });
        if (completionRequestId.current !== requestId) return;

        if (result.solved) {
          setStatusMessage("Puzzle solved");
          return;
        }

        if (result.valid) {
          setStatusMessage("Grid is complete but not solved");
          return;
        }

        setStatusMessage("Grid has conflicts");
      } catch (_error) {
        if (completionRequestId.current === requestId) {
          setStatusMessage("Check failed");
        }
      }
    },
    [game.puzzleId],
  );

  useEffect(() => {
    if (!liveValidation) {
      setConflicts(new Set());
      return;
    }

    const requestId = validationRequestId.current + 1;
    validationRequestId.current = requestId;

    void validateGrid({ grid: game.grid })
      .then((result) => {
        if (validationRequestId.current !== requestId) return;
        const next = new Set<string>();
        for (const error of result.errors) {
          if (error.row >= 0 && error.col >= 0) {
            next.add(keyFor(error.row, error.col));
          }
        }
        setConflicts(next);
      })
      .catch(() => {
        if (validationRequestId.current === requestId) {
          setStatusMessage("Validation unavailable");
        }
      });
  }, [game.grid, liveValidation]);

  useEffect(() => {
    if (liveValidation) return;
    if (!gridFilled(game.grid)) return;

    const key = JSON.stringify(game.grid);
    if (lastAutoCheckGrid.current === key) return;
    lastAutoCheckGrid.current = key;

    void runCheckSolved(game.grid);
  }, [game.grid, liveValidation, runCheckSolved]);

  const applyAction = useCallback(
    (mutator: (grid: Grid, notes: number[][][]) => { changed: boolean; cleanup: boolean }) => {
      setGame((prev) => {
        if (!selected) return prev;
        if (prev.givens[selected.row][selected.col] !== 0) return prev;

        const nextGrid = cloneGrid(prev.grid);
        let nextNotes = cloneNotes(prev.notes);
        const result = mutator(nextGrid, nextNotes);
        if (!result.changed) return prev;

        if (result.cleanup) {
          nextNotes = cleanupNotesForCompletedDigits(nextGrid, nextNotes);
        }

        const snapshot: Snapshot = {
          grid: cloneGrid(prev.grid),
          notes: cloneNotes(prev.notes),
        };

        const undo = [...prev.undo, snapshot].slice(-5);
        lastAutoCheckGrid.current = "";

        return {
          ...prev,
          grid: nextGrid,
          notes: nextNotes,
          undo,
        };
      });
    },
    [selected],
  );

  const handleDigit = useCallback(
    (digit: number) => {
      applyAction((grid, notes) => {
        if (!selected) return { changed: false, cleanup: false };
        const current = grid[selected.row][selected.col];

        if (notesMode) {
          if (current !== 0) return { changed: false, cleanup: false };
          const list = notes[selected.row][selected.col];
          const exists = list.includes(digit);
          notes[selected.row][selected.col] = exists
            ? list.filter((value) => value !== digit)
            : [...list, digit].sort((a, b) => a - b);
          return { changed: true, cleanup: false };
        }

        if (current === digit) return { changed: false, cleanup: false };

        grid[selected.row][selected.col] = digit;
        notes[selected.row][selected.col] = [];
        return { changed: true, cleanup: true };
      });
    },
    [applyAction, notesMode, selected],
  );

  const handleClear = useCallback(() => {
    applyAction((grid, notes) => {
      if (!selected) return { changed: false, cleanup: false };
      const currentValue = grid[selected.row][selected.col];
      const currentNotes = notes[selected.row][selected.col];
      const hasNotes = currentNotes.length > 0;

      if (currentValue === 0 && !hasNotes) return { changed: false, cleanup: false };

      grid[selected.row][selected.col] = 0;
      notes[selected.row][selected.col] = [];
      return { changed: true, cleanup: true };
    });
  }, [applyAction, selected]);

  const handleUndo = useCallback(() => {
    setGame((prev) => {
      if (prev.undo.length === 0) return prev;
      const snapshot = prev.undo[prev.undo.length - 1];
      return {
        ...prev,
        grid: cloneGrid(snapshot.grid),
        notes: cloneNotes(snapshot.notes),
        undo: prev.undo.slice(0, -1),
      };
    });
    lastAutoCheckGrid.current = "";
  }, []);

  const handleCheck = useCallback(() => {
    void runCheckSolved(game.grid);
  }, [game.grid, runCheckSolved]);

  const handleNewGame = useCallback(() => {
    void loadPuzzle(difficulty);
  }, [difficulty, loadPuzzle]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "9") {
        handleDigit(Number(event.key));
      } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
        handleClear();
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        handleUndo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClear, handleDigit, handleUndo]);

  const selectedGiven = useMemo(() => {
    if (!selected) return false;
    return game.givens[selected.row][selected.col] !== 0;
  }, [game.givens, selected]);

  return (
    <div className="app-shell">
      <TopBar difficulty={difficulty} onDifficultyChange={setDifficulty} />

      <div className="status-card" aria-live="polite">
        <p className="status-line">{statusMessage}</p>
        <p className="status-line muted">
          {notesMode ? "Notes mode on" : "Notes mode off"} · {liveValidation ? "Live check on" : "Live check off"}
        </p>
        {selectedGiven ? (
          <p className="status-line muted">Selected cell is fixed</p>
        ) : null}
      </div>

      <SudokuGrid
        grid={game.grid}
        givens={game.givens}
        notes={game.notes}
        selected={selected}
        conflicts={conflicts}
        onSelect={(row, col) => setSelected({ row, col })}
      />

      <NumberPad
        notesMode={notesMode}
        liveValidation={liveValidation}
        canUndo={game.undo.length > 0}
        onDigit={handleDigit}
        onClear={handleClear}
        onToggleNotesMode={() => setNotesMode((prev) => !prev)}
        onToggleLiveValidation={() => setLiveValidation((prev) => !prev)}
        onUndo={handleUndo}
        onCheck={handleCheck}
        onNewGame={handleNewGame}
      />

      {loadingPuzzle ? <p className="foot-note">Loading new puzzle</p> : null}
    </div>
  );
}
