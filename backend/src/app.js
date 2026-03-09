import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import filepathRoutes from "./routes/filepath.routes.js";
import browserFinderRoutes from "./routes/browserFinder.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/paths", filepathRoutes);
app.use("/api/file", express.static("/"));
app.use("/api/findImg", browserFinderRoutes);

// ✅ Frontend serving
const frontendPath = path.join(__dirname, "../../Friend-Ecom-Web/dist");
app.use(express.static(frontendPath));
app.get("/health", (req, res) => res.json({ status: "ok" }));

export default app;
