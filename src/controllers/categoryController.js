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
    const { name, title, parent_category } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const uuid = uuidv4();
    const slug = slugify(name, { lower: true, strict: true });

    let imageValue = null;
    if (req.files && req.files.length > 0) {
      imageValue = JSON.stringify(
        req.files.map((file) => "/uploads/" + file.filename)
      );
    } else if (req.file) {
      imageValue = JSON.stringify(["/uploads/" + req.file.filename]);
    }

    const [newCategoryId] = await db("category").insert({
      uuid,
      name,
      slug,
      title,
      image: imageValue,
      parent_category,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      id: newCategoryId,
      uuid,
      image: imageValue,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.query;
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
    const { id } = req.query;
    const { name, title, parent_category } = req.body;

    const existingCategory = await db("category").where({ id }).first();
    if (!existingCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    let updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (title !== undefined) updateData.title = title;
    if (parent_category !== undefined)
      updateData.parent_category = parent_category;

    if (req.files && req.files.length > 0) {
      updateData.image = JSON.stringify(
        req.files.map((file) => "/uploads/" + file.filename)
      );
    } else if (req.file) {
      updateData.image = JSON.stringify(["/uploads/" + req.file.filename]);
    }

    await db("category").where({ id }).update(updateData);

    const updatedCategory = await db("category").where({ id }).first();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
