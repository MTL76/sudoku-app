import fs from "node:fs";
import path from "node:path";

const DIFFICULTIES = ["easy", "intermediate", "difficult", "expert"];
const DEFAULT_TARGET = 200;

const args = process.argv.slice(2);
const argMap = new Map();
for (let i = 0; i < args.length; i += 2) {
  argMap.set(args[i], args[i + 1]);
}

const sourceFile = argMap.get("--source");
const targetPerDifficulty = Number(argMap.get("--count") ?? DEFAULT_TARGET);
const outputFile = argMap.get("--out") ?? "src/sudoku/puzzles.json";

if (!sourceFile) {
  console.error("Missing --source path");
  process.exit(1);
}

const backendRoot = process.cwd();
const sourcePath = path.resolve(backendRoot, sourceFile);
const outputPath = path.resolve(backendRoot, outputFile);

const raw = fs.readFileSync(sourcePath, "utf8");
const dataset = JSON.parse(raw);
if (!Array.isArray(dataset)) {
  throw new Error("Dataset must be a JSON array");
}

const parseGrid = (input) => {
  if (typeof input !== "string" || input.length !== 81) return null;
  const rows = [];
  for (let r = 0; r < 9; r++) {
    const row = [];
    for (let c = 0; c < 9; c++) {
      const value = Number(input[r * 9 + c]);
      if (!Number.isInteger(value) || value < 0 || value > 9) return null;
      row.push(value);
    }
    rows.push(row);
  }
  return rows;
};

const copyGrid = (grid) => grid.map((row) => [...row]);

const isAllowed = (grid, row, col, value) => {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === value) return false;
    if (grid[i][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === value) return false;
    }
  }

  return true;
};

const findBestEmpty = (grid) => {
  let best = null;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) continue;

      const candidates = [];
      for (let value = 1; value <= 9; value++) {
        if (isAllowed(grid, row, col, value)) candidates.push(value);
      }

      if (candidates.length === 0) return { row, col, candidates };
      if (!best || candidates.length < best.candidates.length) {
        best = { row, col, candidates };
      }
    }
  }

  return best;
};

const countSolutionsUpToTwo = (grid) => {
  const work = copyGrid(grid);
  let count = 0;

  const solve = () => {
    if (count >= 2) return;
    const next = findBestEmpty(work);
    if (!next) {
      count += 1;
      return;
    }

    if (next.candidates.length === 0) return;

    for (const candidate of next.candidates) {
      work[next.row][next.col] = candidate;
      solve();
      work[next.row][next.col] = 0;
      if (count >= 2) return;
    }
  };

  solve();
  return count;
};

const bucketForDifficulty = (rawDifficulty) => {
  const normalized = String(rawDifficulty ?? "").trim().toLowerCase();
  if (["easy", "beginner"].includes(normalized)) return "easy";
  if (["intermediate", "medium"].includes(normalized)) return "intermediate";
  if (["difficult", "hard"].includes(normalized)) return "difficult";
  if (["expert", "extreme", "evil"].includes(normalized)) return "expert";
  return null;
};

const result = {
  easy: [],
  intermediate: [],
  difficult: [],
  expert: [],
};

const counters = {
  easy: 1,
  intermediate: 1,
  difficult: 1,
  expert: 1,
};

for (const item of dataset) {
  const bucket = bucketForDifficulty(item.difficulty);
  if (!bucket) continue;
  if (result[bucket].length >= targetPerDifficulty) continue;

  const grid = parseGrid(item.puzzle);
  const solution = parseGrid(item.solution);
  if (!grid || !solution) continue;

  if (countSolutionsUpToTwo(grid) !== 1) continue;

  const id = String(counters[bucket]).padStart(3, "0");
  counters[bucket] += 1;

  result[bucket].push({
    puzzleId: `${bucket}-${id}`,
    difficulty: bucket,
    grid,
    solution,
  });

  if (DIFFICULTIES.every((key) => result[key].length >= targetPerDifficulty)) {
    break;
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log(`Wrote puzzle bank to ${outputPath}`);
for (const level of DIFFICULTIES) {
  console.log(`${level}: ${result[level].length}`);
}
