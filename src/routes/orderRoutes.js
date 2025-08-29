import express from "express";
import { createOrder, getAllOrders, getOrderByCustomer_Id, getOrderById, updateOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/createOrder", createOrder); 
router.get("/getAllOrders", getAllOrders);  
router.get("/getOrderByCustomer_Id/:id", getOrderByCustomer_Id);   
router.patch("/getOrderById/:id", getOrderById);    
router.delete("/updateOrder/:id", updateOrder); 

export default router;
