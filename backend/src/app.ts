import express from "express";
import type { RequestHandler } from "express";

export const app = express();

app.use(express.json());

export const healthHandler: RequestHandler = (_req, res) => {
  res.json({ ok: true });
};

app.get("/health", healthHandler);
