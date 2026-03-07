import express from "express";
import {
  basicFolderExplorer,
  defaultFolderExplorer,
} from "../controllers/filepath.controller.js";

const router = express.Router();

router.get("", defaultFolderExplorer);
router.get("/path", basicFolderExplorer);

export default router;
