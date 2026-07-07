import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  const status = message.includes("Only .csv") || message.includes("File too large") ? 400 : 500;

  res.status(status).json({
    success: false,
    error: message
  });
};
