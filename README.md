# Sudoku App Monorepo

Mobile-first Sudoku web app built as a TypeScript monorepo.

Initial scope:
- Frontend + backend only (no database yet)
- Backend serves health and Sudoku API endpoints
- Frontend calls backend through Vite proxy during development

## Tech Stack

- Frontend: Vite + React + TypeScript
- Backend: Node.js + Express + TypeScript

## Repository Structure

```text
.
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## Local Development

Install dependencies:

```bash
cd frontend && npm install
cd ../backend && npm install
cd ..
```

Run both apps from repository root:

```bash
npm run dev
```

Development ports:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

Proxy approach:
- Frontend uses Vite dev server proxy for `/api` and `/health` to `http://localhost:3001`.
- Because of this proxy setup, CORS is not needed at this stage.

## API

### `GET /health`

Health check endpoint.

Example response:

```json
{
  "ok": true
}
```

### `GET /api/puzzle`

Returns a generated Sudoku puzzle for the UI.

Example response shape:

```json
{
  "id": "puzzle-2026-02-15-001",
  "difficulty": "easy",
  "grid": [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9]
  ]
}
```

### `POST /api/validate`

Validates a Sudoku move or full grid state.

Example request shape:

```json
{
  "puzzleId": "puzzle-2026-02-15-001",
  "grid": [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ]
}
```

Example response shape:

```json
{
  "valid": true,
  "errors": []
}
```

## Roadmap

- Implement `GET /api/puzzle` with difficulty options
- Implement `POST /api/validate` for move and board validation
- Add frontend game state flow (new game, input, validation feedback)
- Add unit tests for puzzle generation and validation logic
- Add persistence layer when multi-session progress is needed
