import type { Difficulty } from "../types/sudoku";

type TopBarProps = {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
};

const OPTIONS: Difficulty[] = [
  "easy",
  "intermediate",
  "difficult",
  "expert",
];

export function TopBar({ difficulty, onDifficultyChange }: TopBarProps) {
  return (
    <header className="top-bar">
      <h1 className="top-title">Sudoku</h1>
      <label className="difficulty-wrap" htmlFor="difficulty-select">
        <span>Difficulty</span>
        <select
          id="difficulty-select"
          value={difficulty}
          onChange={(event) =>
            onDifficultyChange(event.target.value as Difficulty)
          }
        >
          {OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
