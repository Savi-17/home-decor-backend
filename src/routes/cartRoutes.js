import express from "express";
import { addToCart, getCartItems, updateCartItem, applyCouponToCart, removeCartItem  } from "../controllers/cartController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/addToCart", authMiddleware, addToCart);
router.get("/getCartItems", authMiddleware, getCartItems);
router.patch("/updateCartItem", authMiddleware, updateCartItem);
router.patch("/applyCouponToCart", authMiddleware, applyCouponToCart);
router.delete("/removeCartItem", authMiddleware, removeCartItem);

export default router;