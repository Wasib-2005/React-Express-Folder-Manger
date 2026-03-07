import express from "express";
import { folderExplorer } from "../controllers/filepath.controller.js";

const router = express.Router();

router.get("/", folderExplorer);

export default router;