import db from "../config/db.js";

export const listWishlist = async (req, res) => {
  try {
    const { customer_id } = req.query;
    if (!customer_id) {
      return res
        .status(400)
        .json({ success: false, message: " Valid Customer ID is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [{ count }] = await db("wishlist")
      .where({ customer_id })
      .count("id as count");

    const data = await db("wishlist")
      .where({ customer_id })
      .join("products", "wishlist.product_id", "products.id")
      .select(
        "wishlist.id",
        "products.id as product_id",
        "products.uuid as product_uuid",
        "products.name",
        "products.slug",
        "products.price",
        "products.discounted_price",
        "products.thumbnail",
        "products.images"
      )
      .limit(limit)
      .offset(offset);

    res.status(200).json({
      success: true,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      data,
    });
  } catch (error) {
    console.error("Error listing wishlist:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
    try {
        const { customer_id, product_id } = req.body;

        if ( !customer_id || !product_id ) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const data = await db("wishlist").where({ customer_id, product_id }).first("id");
        if (!data) {
            return res.status(404).json({ success: false, message: "Product/Customer not found" });
        }

        const [newWishlistId] = await db("wishlist").insert({
            customer_id: data.customer_id,
            product_id: data.product_id,
            product_uuid: data.product_uuid
        });

        res.status(201).json({
            success: true,
            message: "product added to wishlist successfully",
            id: newWishlistId,
        });
    } catch (error) {
        console.error("Error adding stock:", error);
         res.status(500).json({ success: false, message: error.message });
    }
};

export const updateWishlist = async (req, res) => {
  try {
    const { id } = req.query;
    const { customer_id, product_id } = req.body;
    
    const existingWishlist = await db("wishlist").where({ id }).first();
    if (!existingWishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist item not found" });
    }

    if (customer_id && product_id) {
      const duplicate = await db("wishlist")
        .where({ customer_id, product_id })
        .whereNot({ id }) 
        .first("id");

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "This product already exists in customer's wishlist",
        });
      }
    }

    const updateData = {};
    if (customer_id) updateData.customer_id = customer_id;
    if (product_id) updateData.product_id = product_id;
    updateData.updated_at = new Date();

    await db("wishlist").where({ id }).update(updateData);

    const updatedWishlist = await db("wishlist").where({ id }).first();

    res.json({
      success: true,
      message: "Wishlist updated successfully",
      data: updatedWishlist,
    });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.query;

    const existingWishlist = await db("wishlist").where({ id }).first();
    if (!existingWishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist item not found" });
    }

    await db("wishlist").where({ id }).del();

    res.json({
      success: true,
      message: "Wishlist item removed successfully",
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    res
      .status(500)
      .json({ success: false, message: error.message });
  }
}