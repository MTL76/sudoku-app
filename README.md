# Sudoku App

Mobile first Sudoku web app built in a TypeScript monorepo.

Scope in V1:
- Frontend and backend only
- No database
- Puzzle state, notes, undo, and settings stay on client
- Backend serves puzzles and validation APIs

## Stack

- Frontend: Vite, React, TypeScript
- Backend: Node.js, Express, TypeScript

## Repository

```text
.
├── backend/
│   ├── data/
│   │   └── puzzles-dataset.json
│   ├── scripts/
│   │   └── build-puzzle-bank.mjs
│   ├── src/
│   │   ├── sudoku/
│   │   │   ├── puzzle-bank.ts
│   │   │   ├── puzzles.json
│   │   │   └── validate.ts
│   │   ├── __tests__/
│   │   │   └── validate.test.ts
│   │   ├── app.test.ts
│   │   ├── app.ts
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── components/
│   │   │   ├── NumberPad.tsx
│   │   │   ├── SudokuGrid.tsx
│   │   │   └── TopBar.tsx
│   │   ├── styles/
│   │   │   └── app.css
│   │   ├── types/
│   │   │   └── sudoku.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── package.json
```

## Local Development

Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

Run both services from root:

```bash
npm run dev
```

Ports:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

Frontend uses Vite dev proxy for `/api` and `/health` to backend, so CORS is not used in this stage.

## API

### `GET /health`

```json
{
  "ok": true
}
```

### `GET /api/puzzle?difficulty=easy|intermediate|difficult|expert`

Returns one random puzzle from the puzzle bank.

```json
{
  "puzzleId": "easy-001",
  "difficulty": "easy",
  "grid": [
    [5, 3, 0, 6, 7, 8, 0, 1, 2],
    [6, 7, 2, 1, 0, 5, 3, 0, 8],
    [1, 0, 8, 3, 4, 2, 5, 6, 0],
    [8, 5, 9, 7, 6, 1, 0, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 0, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 0, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 0, 5, 2, 8, 6, 1, 7, 9]
  ]
}
```

### `POST /api/validate`

Checks Sudoku conflicts for the submitted grid.

Request:

```json
{
  "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0]]
}
```

Response shape:

```json
{
  "valid": false,
  "errors": [
    {
      "row": 0,
      "col": 0,
      "reason": "row",
      "message": "Duplicate value 5 in row"
    }
  ]
}
```

### `POST /api/check-solved`

Checks whether a grid is valid and fully solved for a known puzzle.

Request:

```json
{
  "puzzleId": "easy-001",
  "grid": [[0, 0, 0, 0, 0, 0, 0, 0, 0]]
}
```

Response:

```json
{
  "solved": false,
  "valid": true
}
```

## Frontend Features

- Mobile first touch board with desktop mouse support
- Difficulty selector and new game flow
- Given cells locked and styled separately from user values
- Notes mode with candidate toggles per cell
- Undo for last five keypad actions
- Automatic notes cleanup when any digit count reaches nine
- Highlight selected cell, row, column, box, same value, and conflicts
- Live check toggle plus explicit check action
- Auto completion check when live check is off

## Puzzle Bank

A placeholder bank is included in `backend/src/sudoku/puzzles.json` so the app runs immediately.

To build a larger bank from a dataset:

```bash
cd backend
npm run puzzle:build
```

The build script:
- Reads `backend/data/puzzles-dataset.json`
- Buckets by difficulty
- Verifies one solution using a solver that counts up to two
- Writes `backend/src/sudoku/puzzles.json`

## Backend Tests

```bash
cd backend
npm test
```
