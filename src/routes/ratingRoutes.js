import express from "express";
import { upload } from "../middlewares/upload.js";
import { createRating, listRatings, updateRating, deleteRating } from "../controllers/ratingController.js";

const router = express.Router();

router.post("/addRating", upload.single("image"), createRating);
router.get("/listRatings", listRatings);
router.put("/updateRating", upload.single("image"), updateRating);  
router.delete("/deleteRating", deleteRating);

export default router;
