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

export const productByCategories = async (req, res) => {
  try {
    const data = await db("category")
      .leftJoin('products', 'products.category_id', 'category.id')
      .select(
        'category.id',
        'category.name',
        'category.image',
        'products.category_id'
      )
      .count('products.id as total_products')
      .groupBy('category.id', 'category.name', 'category.image', 'products.category_id');

    res.json({
      success: true,
      data,
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
    const { name, title, parent_category, parent_category_id } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const uuid = uuidv4();
    const slug = slugify(name, { lower: true, strict: true });

    let imageValue = null;
    if (req.files && req.files.length > 0) {
      imageValue = JSON.stringify(req.files.map((file) => "/uploads/" + file.filename));

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
      parent_category_id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      id: newCategoryId,
      uuid,
      image: imageValue,
    });
  } catch (error) {
    if (!req.file) {
        return res.status(400).json({
        success: false,
        message: "Image is required",
    });
   }
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const offset = (page - 1) * limit;

    const categoryData = await db("category")
      .select("id", "name", "slug", "title as description", "image as banner")
      .where("slug", slug)
      .first();

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const totalProductsResult = await db("products")
      .count("id as count")
      .where("category_id", categoryData.id)
      .first();

    const totalProducts = totalProductsResult?.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await db("products")
      .select("id", "name", "price", "image")
      .where("category_id", categoryData.id)
      .offset(offset)
      .limit(limit);

    res.json({
      success: true,
      data: {
        category: categoryData,
        products,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching category with pagination:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const categoriesByParentCategoryId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      console.warn("No id provided in req.params:", req.params);
      return res.status(400).json({ success: false, message: "Missing parent category id" });
    }
    const data = await db("category")
      .where("parent_category_id", id)
      .select("name", "id", "slug");

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

export const AllCategory = async (req, res) => {
  try {
    const data = await db("category").select("id", "slug", "name","parent_category_id", "parent_category").orderBy("parent_category_id", "asc");
    const final = data.filter((v)=>!v.parent_category_id).map((cat)=>{
   return{ 
    ...cat,
    child:data.filter((x)=>x.parent_category_id==cat.id)
   }
})
    return res.json({ success: true, final });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
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
