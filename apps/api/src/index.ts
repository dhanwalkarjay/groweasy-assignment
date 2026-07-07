import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { importRouter } from "./routes/import.route.js";

const app = express();

app.use((req, res, next) => {
  console.log(`>>> INCOMING: ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const originLower = origin.toLowerCase();
      const isLocalhost = originLower.startsWith("http://localhost:") || originLower.startsWith("http://127.0.0.1:");
      const isVercel = originLower.endsWith(".vercel.app");
      const isCustomAllowed = env.corsOrigin && (origin === env.corsOrigin || env.corsOrigin === "*");
      
      if (isLocalhost || isVercel || isCustomAllowed) {
        return callback(null, true);
      }
      console.warn(`>>> [CORS] Blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/import", importRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`GrowEasy API listening on http://localhost:${env.port}`);
});
