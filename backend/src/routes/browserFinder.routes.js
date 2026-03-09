import express from "express";
import { foundImgs } from "../controllers/browserFinder.controller.js";

const router = express.Router();

router.post("", foundImgs);

export default router;
