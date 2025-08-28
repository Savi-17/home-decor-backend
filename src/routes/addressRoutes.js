import express from "express";
import { createAddress, getAllAddresses, getAddressById, updateAddress, deleteAddress, setDefaultAddress } from "../controllers/addressController.js";

const router = express.Router();

router.post("/addresses", createAddress); 
router.get("/addresses", getAllAddresses);  
router.get("/addresses/:id", getAddressById);   
router.patch("/addresses/:id", updateAddress);    
router.delete("/addresses/:id", deleteAddress); 
router.patch("/addresses/:id/default", setDefaultAddress); 

export default router;
