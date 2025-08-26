import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const listStock = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const stocks = await db("stock")
            .select("*")
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset);
        const [{ count }] = await db("stock").count("* as count");
        res.json({
            success: true,
            page,
            limit,
            total: parseInt(count),
            data: stocks,
        });
    } catch (error) {
        console.error("Error fetching stock:", error);
            res.status(500).json({ success: false, message: error.message });
    }
};

export const addStock = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity ) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const data = await db("products").where({ id: product_id }).first();
        if (!data) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const [newStockId] = await db("stock").insert({
            product_id: data.id,
            product_uuid: data.uuid,
            product_slug: data.slug,
            quantity
        });

        res.status(201).json({
            success: true,
            message: "Stock added successfully",
            id: newStockId,
        });
    } catch (error) {
        console.error("Error adding stock:", error);
         res.status(500).json({ success: false, message: error.message });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.query;
        const { product_id, quantity } = req.body;

        const existingStock = await db("stock").where({ id }).first();
        if (!existingStock) {
            return res.status(404).json({ success: false, message: "Stock not found" });
        }

        const data = await db("products").where({ id: product_id }).first();
        if (!data) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const updateData = {};
        if (quantity) updateData.quantity = quantity;
        if (product_id) {
            updateData.product_id = data.id;
            updateData.product_uuid = data.uuid;
            updateData.product_slug = data.slug;
        }

        await db("stock").where({ id }).update({ updateData});
        const updatedStock = await db("stock").where({ id }).first();

        res.json({
            success: true,
            message: "Stock updated successfully",
        });
    } catch (error) {
        console.error("Error updating stock:", error);
         res.status(500).json({ success: false, message: error.message });
    }
}