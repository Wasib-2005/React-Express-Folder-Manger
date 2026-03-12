import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import filepathRoutes from "./routes/filepath.routes.js";
import browserFinderRoutes from "./routes/browserFinder.routes.js";
import mangaListRoutes from "./routes/mangaList.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed origins for CORS
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || [];

// ─── Middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked CORS request from: ${origin}`);
        callback(new Error(`CORS not allowed from ${origin}`));
      }
    },
    credentials: true,
  })
);

// Logging middleware
app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.headers["user-agent"];
  const time = new Date().toISOString();

  console.log(`[${time}] ${ip} -> ${method} ${url} | ${userAgent}`);
  next();
});

app.use(express.json());

// ─── API Routes ─────────────────────────────────────────────
app.use("/api/paths", filepathRoutes);
app.use("/api/file", express.static("/")); // your file serving
app.use("/api/browser/find", browserFinderRoutes);
app.use("/api/manga", mangaListRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ─── Frontend SPA ───────────────────────────────────────────
// Path to your built frontend
const frontendPath = path.join(__dirname, "../../frontend/dist");

// Serve static files
app.use(express.static(frontendPath));

// SPA fallback: serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;