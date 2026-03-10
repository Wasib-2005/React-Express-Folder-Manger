import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import filepathRoutes from "./routes/filepath.routes.js";
import browserFinderRoutes from "./routes/browserFinder.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || [];

console.log(allowedOrigins)

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like Postman or server-to-server
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

app.use(express.json());

app.use("/api/paths", filepathRoutes);
app.use("/api/file", express.static("/"));
app.use("/api/findImg", browserFinderRoutes);

// ✅ Frontend serving
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
