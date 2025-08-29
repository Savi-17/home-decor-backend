import db from "../config/db.js";

export const listOrderedItems = async (req, res) => {
  try {
    const { o_id } = req.query;

    if (!o_id) {
      return res.status(400).json({ success: false, message: "Order ID (o_id) is required" });
    }

    const items = await db("ordered_item as oi")
      .join("order as o", "oi.o_id", "=", "o.o_id")
      .select(
        "oi.id",
        "oi.uuid",
        "oi.product_id",
        "oi.quantity",
        "oi.expected_delivery_date",
        "oi.price",
        "oi.status",
        "oi.created_at",
        "oi.updated_at"
      )
      .where("oi.o_id", o_id);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderedItem = async (req, res) => {
  try {
    const { id } = req.query;
    const { quantity, expected_delivery_date, price, status } = req.body;

    const item = await db("ordered_item").where({ id }).first();
    if (!item) {
      return res.status(404).json({ success: false, message: "Order item not found" });
    }

    await db("ordered_item")
      .where({ id })
      .update({
        quantity,
        expected_delivery_date,
        price,
        status,
        updated_at: new Date(),
      });

    res.json({ success: true, message: "Order item updated" });
  } catch (error) {
    console.error("Error updating order item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
