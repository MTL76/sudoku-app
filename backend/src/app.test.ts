import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { healthHandler } from "./app";

describe("API", () => {
  it("GET /health returns ok true", () => {
    const json = vi.fn();
    const res = { json } as unknown as Response;

    healthHandler({} as never, res, (() => undefined) as never);

    expect(json).toHaveBeenCalledWith({ ok: true });
  });
});
