import express from "express";
import { mangaList } from "../controllers/mangaList.controller.js";

const router = express.Router();

router.get("/list", mangaList);

export default router;
