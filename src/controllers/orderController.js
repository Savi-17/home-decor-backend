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

export const getAllOrders = async ( req, res ) => {
    try {
       //admin
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;  
        const offset = (page - 1) * limit;
        const orders = await db("order").select("*").orderBy("created_at", "desc").limit(limit).offset(offset);
        const [{ count }] = await db("order").count("* as count");
        res.json({ success: true, page, limit, total: parseInt(count), data: orders });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderByCustomer_Id = async ( req, res ) => {
    try {
        const { customer_uuid } = req.query;
        if (!customer_uuid) {
            return res.status(400).json({ success: false, message: "Customer UUID is required" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const orders = await db("order").where({ customer_uuid }).orderBy("created_at", "desc").limit(limit).offset(offset);
        const [{ count }] = await db("order").where({ customer_uuid }).count("* as count");
        res.json({ success: true, page, limit, total: parseInt(count), data: orders });
    } catch (error) {
        console.error("Error fetching orders by customer id:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderById = async (req, res) => {
  try {
    const { o_id } = req.query;

    if (!o_id) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await db("order").where({ o_id }).first();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const orderItems = await db("order_item as oi")
      .join("products as p", "oi.product_id", "p.id")
      .where("oi.o_id", o_id)
      .select(
        "oi.id",
        "oi.uuid",
        "oi.product_id",
        "oi.quantity",
        "oi.expected_delivery_date",
        "oi.price",
        "oi.status as item_status",
        "p.uuid as product_uuid",
        "p.SKU",
        "p.name",
        "p.image"
      );

    res.json({
      success: true,
      data: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error("Error fetching order by id:", error);
    res.status(500).json({ success: false, message: error.message });
  
    }
};

export const updateOrder = async ( req, res ) => {
    try { 
        const { o_id } = req.query;
        const { shipping_address, billing_address, payment_status, status } = req.body; 
        if ( !o_id ) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        } 

        const order = await db("order").where({ o_id }).first();
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const updatedOrder = {};
        if (shipping_address) updatedOrder.shipping_address = shipping_address;
        if (billing_address) updatedOrder.billing_address = billing_address;
        if (payment_status) updatedOrder.payment_status = payment_status;
        if (status) updatedOrder.status = status;
        updatedOrder.updated_at = new Date();

        await db("order").where({ o_id }).update(updatedOrder);
        res.json({ success: true, message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
