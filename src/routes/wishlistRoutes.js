import express from "express";
import { listWishlist, addToWishlist, updateWishlist } from "../controllers/wishlistController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/listWishlist", authMiddleware, listWishlist);
router.post("/addToWishlist", authMiddleware, addToWishlist);
router.put("/updateWishlist", authMiddleware, updateWishlist);
router.delete("/removeFromWishlist", authMiddleware, updateWishlist);

export default router;