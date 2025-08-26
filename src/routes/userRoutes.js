import express from "express";
import { registerUser, loginUser, listUsers } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Web
router.post("/register", validate({
    name: "required|string|minLength:3|maxLength:50",
    gender: "required|string|minLength:1|maxLength:10",
    dob: "required|date",
    email: "required|email",
    password: "required|string|minLength:6|maxLength:20",
    contact: "required|string|minLength:10|maxLength:15",
    pincode: "required|string|minLength:6|maxLength:10"
  }), registerUser);
  
router.get("/login", loginUser);

// Admin
router.get("/admin/users", authMiddleware, listUsers);

export default router;
