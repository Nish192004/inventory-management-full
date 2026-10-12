import express from "express";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search?q=mouse
router.get("/", globalSearch);

export default router;