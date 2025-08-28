import db from "../config/db.js";

export const createRating = async (req, res) => {
  try {
    const { rating, product_uuid, comment, status } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!product_uuid) {
      return res.status(400).json({
        success: false,
        message: "Product UUID is required",
      });
    }

    const product = await db("products")
      .where({ uuid: product_uuid })
      .first("id", "uuid", "SKU");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/ratings/${req.file.filename}`;
    }

    const [id] = await db("rating").insert({
      rating,
      SKU: product.SKU,
      product_uuid: product.uuid,
      image: imagePath,
      comment,
      status: status || "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    const newRating = await db("rating").where({ id }).first();

    res.status(201).json({
      success: true,
      message: "Rating created successfully",
      data: newRating,
    });
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listRatings = async (req, res) => {
  try {
    const { product_uuid } = req.query;
    if (!product_uuid) {
      return res
        .status(400)
        .json({ success: false, message: "Product UUID is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [{ count }] = await db("rating")
      .where({ product_uuid })
      .count("id as count");

    const rating = await db("rating")
      .where({ product_uuid })
      .select(
        "id",
        "rating",
        "SKU",
        "product_uuid",
        "image",
        "comment",
        "status",
        "created_at",
        "updated_at"
      )
      .orderBy("created_at", "desc")
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
      data: rating,
    });
  } catch (error) {
    console.error("Error listing ratings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { id } = req.query;
    const { rating, product_uuid, comment, status } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Rating ID is required" });
    }

    const existingRating = await db("rating").where({ id }).first();
    if (!existingRating) {
      return res
        .status(404)
        .json({ success: false, message: "Rating not found" });
    }

    const updateData = {};

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ success: false, message: "Rating must be between 1 and 5" });
      }
      updateData.rating = rating;
    }

    if (product_uuid) {
      const product = await db("products")
        .where({ uuid: product_uuid })
        .first("uuid", "SKU");

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      updateData.product_uuid = product.uuid;
      updateData.SKU = product.SKU;
    }

    if (req.file) {
      updateData.image = `/uploads/ratings/${req.file.filename}`;
    }

    if (comment !== undefined) updateData.comment = comment;
    if (status !== undefined) updateData.status = status;

    updateData.updated_at = new Date();

    await db("rating").where({ id }).update(updateData);

    const updatedRating = await db("rating").where({ id }).first();

    res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: updatedRating,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRating = async (req, res) => {
    try {
        const { id } = req.query;
    
        if (!id) {
        return res
            .status(400)
            .json({ success: false, message: "Rating ID is required" });
        }
    
        const existingRating = await db("rating").where({ id }).first();
        if (!existingRating) {
        return res
            .status(404)
            .json({ success: false, message: "Rating not found" });
        }
    
        await db("rating").where({ id }).del();
    
        res.status(200).json({
        success: true,
        message: "Rating deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting rating:", error);
        res.status(500).json({ success: false, message: error.message });
    } 
};

