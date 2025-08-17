import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const listProducts = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset =(page -1) * limit;
        const products = await db("products")
            .select("*")
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset);
        const [{ count }] = await db("products").count("* as count");
        res.json({
            success: true,
            page,
            limit,
            total: parseInt(count),
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
};

export const createProduct = async (req,res) => {
    try {
            const { name, category_id, price, SKU, image, description, specification, variant, related, quantity, isFeatured, active_status } = req.body;

         if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "product name is required" });
        }

        const uuid = uuidv4();
        const slug = slugify(name, { lower: true, strict: true });

        const [newProductId] = await db("products").insert({
            uuid,
            name,
            slug,
            category_id,
            price,
            SKU,
            image: JSON.stringify(image),
            description: JSON.stringify(description),
            specification: JSON.stringify(specification),
            variant: JSON.stringify(variant),
            related: JSON.stringify(related),
            quantity,
            isFeatured,
            active_status,
            });

            res.status(201).json({
            success: true,
            message: "Product created successfully",
            id: newProductId,
            uuid
            });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating product",
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db("products").where({ id }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        } else {
            res.json({ success: true, data: product });
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const { name, category_id, price, SKU, image, description, specification, variant, related, quantity, isFeatured, active_status } = req.body;
        const product = await db("products").where({ id }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await db("products").where({ id }).update({
            name,
            category_id,
            price,
            SKU,
            image: JSON.stringify(image),
            description: JSON.stringify(description),
            specification: JSON.stringify(specification),
            variant: JSON.stringify(variant),
            related: JSON.stringify(related),
            quantity,
            isFeatured,
            active_status,
        });
        res.json({ success: true, message: "Product updated successfully" });
        } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error" }); 
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await db("products").where ({ slug}).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        } else {
            res.json({ success: true, data: product });
        }
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const productStatus = async (req, res) => {
    try {
        const {id } = req.params;
        const {active_status} = req.body;
        const product = await db("products").where({ id }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await db("products").where({ id }).update({ active_status });
        res.json({ success: true, message: "Product status updated successfully" });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};