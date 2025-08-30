import express from "express";
import { listOrderedItems } from "../controllers/orderedItemController.js";

const router = express.Router();

router.get("/listOrderedItems", listOrderedItems); 
 

export default router;
