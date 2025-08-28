import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createAddress = async (req, res) => {
  try {
    const { type, name, address,city,state,pincode,country, phone,isDefault } = req.body;

    if ( !type || !name || !address || !city || !state || !pincode || !country || !phone ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const uuid = uuidv4();

    const [newAddressId] = await db("address").insert({ uuid, type, name, address, city, state, pincode, country, phone, is_default: isDefault || true, });

    res.status(201).json({ success: true, message: "Address added successfully", id: newAddressId, uuid, });
    } catch (error) {
           console.error("Error adding Address:", error);
           res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllAddresses = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset =(page -1) * limit;
        const address = await db("address")
            .select("*")
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset);
        const [{ count }] = await db("address").count("* as count");
        res.json({
            success: true,
            page,
            limit,
            total: parseInt(count),
            data: address,
        });
    } catch (error) {
        console.error("Error fetching address:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching address",
        });
    }
};

export const getAddressById = async (req, res) => {
    try {
        const { id } = req.query;
        const address = await db("address").where({ id }).first();
        if (!address) {
            return res.status(404).json({ success: false, message: "address not available" });
        } else {
            res.json({ success: true, data: address });
        }
    } catch (error) {
        console.error("Error fetching address:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateAddress = async (req, res) => {
    try {
    const { id } = req.query;
    const {
        type, 
        name,
        address,
        city,
        state,
        pincode,
        country,
        phone,
        isDefault,
    } = req.body;

    const address1 = await db("address").where({ id }).first();
    if (!address1) {
      return res.status(404).json({ success: false, message: "address not found" });
    }

    const updateData = {};
    if (type !== undefined) updateData.type = type;   
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;    
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (isDefault !== undefined) updateData.is_default = isDefault;
    updateData.updated_at = new Date();

    await db("address").where({ id }).update(updateData);

    const updatedAddress = await db("address").where({ id }).first();

    res.json({
      success: true,
      message: "Address updated successfully",
      product: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await db("address").where({ id }).first();
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        await db("address").where({ id }).del();
        res.json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await db("address").where({ id }).first();
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        await db("address").update({ is_default: false });
        await db("address").where({ id }).update({ is_default: true });
        res.json({ success: true, message: "Default address set successfully" });
    } catch (error) {
        console.error("Error setting default address:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
