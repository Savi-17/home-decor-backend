import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createDiscount = async (req, res) => {
  try {
    const { 
      name, 
      applied_from_date, 
      applied_to_date, 
      applied_on, 
      type, 
      value, 
      target, 
      targeted_value 
    } = req.body;

    if (!name || !applied_from_date || !applied_to_date || !applied_on || !type || !value || !target || !targeted_value) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const uuid = uuidv4();

    const [newDiscountId] = await db("discounts").insert({
      uuid,
      name,
      applied_from_date,
      applied_to_date,
      applied_on,
      type,
      value,
      target,
      targeted_value: JSON.stringify(targeted_value),
    });

    res.status(201).json({
      success: true,
      message: "Discount created successfully",
      id: newDiscountId,
      uuid,
    });

  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const listDiscounts = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset =(page -1) * limit;
        const discount = await db("discount")
            .select("*")
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset);
        const [{ count }] = await db("discount").count("* as count");
        res.json({
            success: true,
            page,
            limit,
            total: parseInt(count),
            data: discount,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
};

export const getDiscountById = async (req, res) => {
    try {
        const { id } = req.query;
        const discount = await db("discount").where({ id }).first();
        if (!discount) {
            return res.status(404).json({ success: false, message: "discount not available" });
        } else {
            res.json({ success: true, data: discount });
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.query;
    const { 
      name, 
      applied_from_date, 
      applied_to_date, 
      applied_on, 
      type, 
      value, 
      target, 
      targeted_value 
    } = req.body;

    const discount = await db("discount").where({ id }).first();
    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not available" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (applied_from_date !== undefined) updateData.applied_from_date = applied_from_date;
    if (applied_to_date !== undefined) updateData.applied_to_date = applied_to_date;
    if (applied_on !== undefined) updateData.applied_on = applied_on;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (target !== undefined) updateData.target = target;
    if (targeted_value !== undefined) updateData.targeted_value = JSON.stringify(targeted_value);

    await db("discount").where({ id }).update(updateData);

    const updatedDiscount = await db("discount").where({ id }).first();

    res.json({ 
      success: true, 
      message: "Discount updated successfully",
      data: updatedDiscount
    });

  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const discountStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await db("products").where({ id }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let newStatus = "off";

        if (product.active_status === "on") {
            if (!product.applied_from_date || !product.applied_to_date) {
                newStatus = "on";
            } else {
                const now = new Date();
                const fromDate = new Date(product.applied_from_date);
                const toDate = new Date(product.applied_to_date);

                if (now >= fromDate && now <= toDate) {
                    newStatus = "on";
                } else {
                    newStatus = "off";
                }
            }
        }

        await db("products").where({ id }).update({ active_status: newStatus });

        res.json({
            success: true,
            message: `Product status updated successfully`,
            active_status: newStatus
        });
    } catch (error) {
        console.error("Error updating discount status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
