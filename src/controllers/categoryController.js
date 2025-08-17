import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

export const listCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const categories = await db("category")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db("category").count("* as count");

    res.json({
      success: true,
      page,
      limit,
      total: parseInt(count),
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, title, image, parent_category } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const uuid = uuidv4();
    const slug = slugify(name, { lower: true, strict: true });

    const [newCategoryId] = await db("category").insert({
      uuid,
      name,
      slug,
      title,
      image: image || "",
      parent_category,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      id: newCategoryId,
      uuid
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db("category").where({ id }).first();

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, image, parent_category } = req.body;

    const existingCategory = await db("category").where({ id }).first();
    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    await db("category").where({ id }).update({
      name,
      title,
      image,
      parent_category,
    });

    res.json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
