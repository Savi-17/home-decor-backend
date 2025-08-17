import express from "express";
import { listCategories, createCategory, getCategoryById, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", listCategories);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.patch("/:id", updateCategory);

export default router;
