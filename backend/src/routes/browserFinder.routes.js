import express from "express";
import {
  foundManga,
  saveManga,
} from "../controllers/browserFinder.controller.js";

const router = express.Router();

router.post("/manga", foundManga);
router.post("/save-manga", saveManga);

export default router;
