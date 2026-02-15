import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
  checkSolvedHandler,
  healthHandler,
  puzzleHandler,
  validateHandler,
} from "./app";
import { getPuzzleById } from "./sudoku/puzzle-bank";

const createRes = () => {
  const json = vi.fn();
  const status = vi.fn().mockImplementation(() => ({ json }));
  return { json, status };
};

describe("API", () => {
  it("GET /health returns ok true", () => {
    const { json } = createRes();
    const res = { json } as unknown as Response;

    healthHandler({} as never, res, (() => undefined) as never);

    expect(json).toHaveBeenCalledWith({ ok: true });
  });

  it("GET /api/puzzle returns puzzle for valid difficulty", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0);
    const { json } = createRes();
    const req = { query: { difficulty: "easy" } } as unknown as Request;
    const res = { json } as unknown as Response;

    puzzleHandler(req, res, (() => undefined) as never);

    const payload = json.mock.calls[0][0];
    expect(payload.difficulty).toBe("easy");
    expect(payload.puzzleId).toBe("intermediate-001");
    expect(payload.puzzleId).toBeTypeOf("string");
    expect(payload.grid).toHaveLength(9);
    vi.restoreAllMocks();
  });

  it("GET /api/puzzle defaults difficulty to intermediate", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0);
    const { json } = createRes();
    const req = { query: {} } as unknown as Request;
    const res = { json } as unknown as Response;

    puzzleHandler(req, res, (() => undefined) as never);

    const payload = json.mock.calls[0][0];
    expect(payload.difficulty).toBe("intermediate");
    expect(payload.puzzleId).toBe("difficult-001");
    vi.restoreAllMocks();
  });

  it("GET /api/puzzle maps intermediate to difficult source", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0);
    const { json } = createRes();
    const req = { query: { difficulty: "intermediate" } } as unknown as Request;
    const res = { json } as unknown as Response;

    puzzleHandler(req, res, (() => undefined) as never);

    const payload = json.mock.calls[0][0];
    expect(payload.puzzleId).toBe("difficult-001");
    expect(payload.difficulty).toBe("intermediate");
    vi.restoreAllMocks();
  });

  it("GET /api/puzzle maps hard to expert source", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0);
    const { json } = createRes();
    const req = { query: { difficulty: "hard" } } as unknown as Request;
    const res = { json } as unknown as Response;

    puzzleHandler(req, res, (() => undefined) as never);

    const payload = json.mock.calls[0][0];
    expect(payload.puzzleId).toBe("expert-001");
    expect(payload.difficulty).toBe("hard");
    vi.restoreAllMocks();
  });

  it("GET /api/puzzle can return different puzzleIds across requests", () => {
    const randomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.7);

    const req = { query: { difficulty: "easy" } } as unknown as Request;

    const first = createRes();
    puzzleHandler(req, { json: first.json } as unknown as Response, (() => undefined) as never);
    const firstId = first.json.mock.calls[0][0].puzzleId as string;

    const second = createRes();
    puzzleHandler(req, { json: second.json } as unknown as Response, (() => undefined) as never);
    const secondId = second.json.mock.calls[0][0].puzzleId as string;

    randomSpy.mockRestore();

    expect(firstId).not.toBe(secondId);
  });

  it("GET /api/puzzle returns 400 for invalid difficulty", () => {
    const { status } = createRes();
    const req = { query: { difficulty: "medium" } } as unknown as Request;
    const res = { status } as unknown as Response;

    puzzleHandler(req, res, (() => undefined) as never);

    expect(status).toHaveBeenCalledWith(400);
  });

  it("POST /api/validate returns valid for empty grid", () => {
    const { json } = createRes();
    const req = {
      body: { grid: Array.from({ length: 9 }, () => Array(9).fill(0)) },
    } as unknown as Request;
    const res = { json } as unknown as Response;

    validateHandler(req, res, (() => undefined) as never);

    expect(json).toHaveBeenCalledWith({ valid: true, errors: [] });
  });

  it("POST /api/check-solved returns solved true for matching solution", () => {
    const puzzle = getPuzzleById("easy-001");
    if (!puzzle) throw new Error("Test puzzle easy-001 not found");

    const { json } = createRes();
    const req = {
      body: { puzzleId: puzzle.puzzleId, grid: puzzle.solution },
    } as unknown as Request;
    const res = { json } as unknown as Response;

    checkSolvedHandler(req, res, (() => undefined) as never);

    expect(json).toHaveBeenCalledWith({ solved: true, valid: true });
  });
});
