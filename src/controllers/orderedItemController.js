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
