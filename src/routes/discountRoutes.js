import express from "express";
import { discountStatus } from "../controllers/discountController.js";

const router = express.Router();

router.get("/:id/discount-status", discountStatus);
router.post("/:id/discount-status", discountStatus);
router.put("/:id/discount-status", discountStatus);

export default router;
