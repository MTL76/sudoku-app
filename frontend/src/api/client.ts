import type {
  Difficulty,
  PuzzleResponse,
  ValidateRequest,
  ValidateResponse,
} from "../types/sudoku";

export async function fetchPuzzle(
  difficulty: Difficulty,
): Promise<PuzzleResponse> {
  const res = await fetch(`/api/puzzle?difficulty=${difficulty}`);
  if (!res.ok) throw new Error(`fetchPuzzle failed: ${res.status}`);
  return res.json();
}

export async function validateGrid(
  body: ValidateRequest,
): Promise<ValidateResponse> {
  const res = await fetch("/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`validateGrid failed: ${res.status}`);
  return res.json();
}
