import express from "express";
import { registerUser, loginUser, listUsers } from "../controllers/userController.js";

const router = express.Router();

// Web
router.post("/register", registerUser);
router.get("/login", loginUser);

// Admin
router.get("/admin/users", listUsers);

export default router;
