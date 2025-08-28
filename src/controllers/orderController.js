import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

//O_id, id, customer_uuid, items, shipping_address, billing_address, sub_total, total, payment_status, delivery_charges, created_at(current_date), updated_at(curr_date), status


export const createOrder = async ( req, res ) => {
    try { 
        const { customer_uuid, items, shipping_address, billing_address, sub_total, total, payment_status, delivery_charges } = req.body; 
        if ( !o_id || !customer_uuid || !items || !shipping_address || !billing_address || !sub_total || !total || !payment_status || !delivery_charges ) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        } 

        const customer = await db("customers").where({ uuid: customer_uuid }).first();
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        const o_id = uuidv4();

        const [ newOrderId ] = await db("order").insert({ o_id, customer_uuid, items, shipping_address, billing_address, sub_total, total, payment_status, delivery_charges });
        res.status(201).json({ success: true, message: "Order created successfully", id: newOrderId, o_id });

    } catch (error) {
  console.error("Error creating order:", error);
  res.status(500).json({ success: false, message: error.message });
  }
};