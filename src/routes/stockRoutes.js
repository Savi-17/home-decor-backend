import express from "express";
import { listStock, addStock } from "../controllers/stockController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/listStock", authMiddleware, listStock);
router.post("/addStock", authMiddleware, addStock);

export default router;