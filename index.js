import express from "express";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ecommerce API is running");
});

import userRoutes from "./src/routes/userRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import stockRoutes from "./src/routes/stockRoutes.js";
import discountRoutes from "./src/routes/discountRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";
import ratingRoutes from "./src/routes/ratingRoutes.js";

app.use("/api/customers", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/rating", ratingRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
