# sudoku-app

Premium mobile first Sudoku web app built as a TypeScript monorepo.

## Prerequisites

* Node.js LTS
* npm

## Setup

Install dependencies from repository root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Run In Development

Start backend and frontend from repository root:

```bash
npm run dev
```

Default local URLs:

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:3001`

## Testing

Run backend tests:

```bash
npm test --prefix backend
```

## Build

Build backend:

```bash
npm run build --prefix backend
```

Build frontend:

```bash
npm run build --prefix frontend
```

## Current Features

* Mobile first Sudoku board with touch friendly controls
* Difficulty selection with levels easy, intermediate, hard
* Locked given cells and editable player cells
* Notes mode with per cell candidate toggles
* Undo support for recent actions
* Live validation toggle and manual check action
* Automatic completion check when the grid becomes full
* Conflict highlighting for invalid placements

UI difficulty labels are mapped to source dataset buckets:

* UI easy maps to source intermediate
* UI intermediate maps to source difficult
* UI hard maps to source expert

## Architecture

Repository structure is split into `backend` and `frontend` under the root, similar to separate Pascal units with clear responsibilities.

Backend responsibilities:

* Serve puzzles through `/api/puzzle`
* Validate Sudoku rules through `/api/validate`
* Check solved state through `/api/check-solved`
* Remain stateless with no database in V1

Frontend responsibilities:

* Hold full game state in memory including grid, notes, undo, and settings
* Render UI and handle player interactions, similar to a Pascal form coordinating view logic

API communication in development uses the Vite proxy. Frontend requests to `/api` and `/health` are forwarded to backend, so no CORS setup is needed for local development.

Game state is intentionally client side in V1 to keep architecture simple, reduce backend scope, and allow fast UI iteration before persistence is introduced.

## Development Approach

This project follows a spec driven development approach. Features are first described and refined as clear requirements, usually in GitHub issues, before implementation begins. This keeps scope controlled and makes architectural decisions intentional rather than accidental.

AI assistance is used to accelerate implementation, refactoring, test writing, and documentation updates. The AI is treated as a coding assistant, not as an autonomous decision maker. All product decisions, architectural choices, and final reviews are made by the human developer.

Changes are implemented in small, focused branches and typically linked to GitHub issues. Pull requests are used to keep changes isolated and traceable. This helps maintain a clean commit history and makes it easier to understand why a change was made.

The goal of this approach is not just speed, but clarity. Specifications drive the work. AI helps with execution. Responsibility remains with the developer.
