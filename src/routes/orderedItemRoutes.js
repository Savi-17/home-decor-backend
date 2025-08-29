import express from "express";
import { listOrderedItems, updateOrderedItem } from "../controllers/orderedItemController.js";

const router = express.Router();

router.get("/listOrderedItems", listOrderedItems); 
router.patch("/updateOrderedItem", updateOrderedItem); 
 
 

export default router;
