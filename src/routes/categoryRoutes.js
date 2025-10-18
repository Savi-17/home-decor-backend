import express from "express";
import { listCategories, createCategory, getCategoryById, updateCategory, productByCategories , getCategoryBySlug, categoriesByParentCategoryId, relatedProductBySlug } from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/listCategory", authMiddleware, listCategories);

router.get("/productByCategories", productByCategories);

router.post(
  "/createCategory",
  authMiddleware,
  upload.single("image"), // First handle form-data
  validate({
    name: "required|string",
    title: "required|string"
  }),
  createCategory
);

router.get("/:id", authMiddleware, getCategoryById);

router.get("/slug/:slug", getCategoryBySlug);

router.get("/ParentCategoryId/:id", categoriesByParentCategoryId);  

router.get("/relatedProductBySlug/:slug", relatedProductBySlug);

router.patch("/:id", authMiddleware, validate({
    name: "required|string",
    title: "required|string",
    parent_category: "required|integer"
}), upload.single("image"), updateCategory);

export default router;
