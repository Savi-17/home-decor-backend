import express from "express";
import { listCategories, createCategory, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/listCategory", authMiddleware, listCategories);

router.post("/createCategory", validate({
    name: "required|string",
    title: "required|string",
    parent_category: "required|integer"
}), authMiddleware, upload.single("image"), createCategory);

router.get("/:id", authMiddleware, getCategoryById);

router.patch("/:id", authMiddleware, validate({
    name: "required|string",
    title: "required|string",
    parent_category: "required|integer"
}), upload.single("image"), updateCategory);

export default router;
