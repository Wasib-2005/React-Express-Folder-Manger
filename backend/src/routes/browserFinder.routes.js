import express from "express";
import { foundManga, saveManga, cancelManga } from "../controllers/browserFinder.controller.js";

const router = express.Router();

router.post("/manga", foundManga);
router.post("/save-manga", saveManga);
router.post("/cancel", cancelManga);

export default router;