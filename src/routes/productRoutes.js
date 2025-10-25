import express from "express";
import { listProducts, createProduct, getProductById, updateProduct, getProductBySlug, productStatus, productsWithFilter, relatedProductBySlug } from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/addProduct",
  authMiddleware,
  upload.single("image"),
  validate({
    name: "required|string",
    category_id: "required|integer",
    price: "required|decimal",
    SKU: "required|string",
    description: "required|string",
    specification: "required|string",
    variant: "required|string",
    related_products: "required|string",
    quantity: "required|integer",
    isFeatured: "required|in:on,off",
    active_status: "required|in:on,off"
  }),
  createProduct
);

router.get("/listProduct", listProducts);

router.get ("/productsWithFilter", productsWithFilter);

router.get("/:id", getProductById);

router.patch("/:id", authMiddleware, upload.single("image"), 
validate({
    name: "required|string",
    category_id: "required|integer",
    price: "required|decimal",
    SKU: "required|string",
    description: "required|string",
    specification: "required|string",
    variant: "required|string",
    related_products: "required|string",
    quantity: "required|integer",
    isFeatured: "required|in:on,off",
    active_status: "required|in:on,off"
  }), updateProduct);

router.get("/slug/:slug", getProductBySlug);

router.get("/relatedProductBySlug/:slug", relatedProductBySlug);

router.patch("/:id/status", validate({
    name: "required|string",
    category_id: "required|integer",
    price: "required|decimal",
    SKU: "required|string",
    description: "required|object",
    specification: "required|object",
    variant: "required|object",
    related: "required|object",
    quantity: "required|integer",
    isFeatured: "boolean",
    active_status: "boolean"
}), upload.single("image"), authMiddleware, productStatus);

export default router;
