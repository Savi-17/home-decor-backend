import express from "express";
import { listProducts, createProduct, getProductById, updateProduct, getProductBySlug, productStatus } from "../controllers/productController.js";

const router = express.Router();

router.get("/", listProducts);
router.post("/", createProduct);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.get("/slug/:slug", getProductBySlug);
router.patch("/:id/status", productStatus);

export default router;
