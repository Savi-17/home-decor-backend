import slugify from "slugify";
import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { request } from "express";

export const createProduct = async (req,res) => {
    try {
            const { name, category_id, price, SKU, description, specification, variant, related_products, quantity, isFeatured, active_status } = req.body;

         if (!name) {
         return res.status(400).json({ success: false, message: "product name is required" });
        }

        const uuid = uuidv4();
        const slug = slugify(name, { lower: true, strict: true });

        let imageValue = null;
        if(req.files && req.files.length > 0 ) {

           imageValue = JSON.stringify(req.files.map((file) => "/uploads/" + file.filename));
        
        } else if (req.file) {
            imageValue = JSON.stringify(["/uploads/" + req.file.filename]);
        }

        const parsedDescription = typeof description === "string" ? JSON.parse(description) : description;
        const parsedSpecification = typeof specification === "string" ? JSON.parse(specification) : specification;
        const parsedVariant = typeof variant === "string" ? JSON.parse(variant) : variant
        const parsedRelated_products = typeof related_products === "string" ? JSON.parse(related_products) : related_products;

        const [newProductId] = await db("products").insert({
            uuid,
            name,
            slug,
            category_id: Number(category_id),
            price: parseFloat(price),
            SKU,
            image: imageValue,
            description: JSON.stringify(parsedDescription),
            specification: JSON.stringify(parsedSpecification),
            variant: JSON.stringify(parsedVariant),
            related_products: JSON.stringify(parsedRelated_products),
            quantity: Number(quantity),
            isFeatured,
            active_status,
            });

            res.status(201).json({
            success: true,
            message: "Product created successfully",
            id: newProductId,
            uuid,
            image: imageValue,
            });

    } catch (error) {

        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating product",

        });
    }
};

export const listProducts = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset =(page -1) * limit;
        const products = await db("products")
            .select("*")
            .orderBy("created_at", "desc")
            .limit(limit)
            .offset(offset);
        const [{ count }] = await db("products").count("* as count");
        res.json({
            success: true,
            page,
            limit,
            total: parseInt(count),
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
};

export const productsWithFilter = async (req, res) => {
    try{
        const filter = req.query.filter;
        let filterData;
        if (filter == 'isFeatured') {
          filterData = { isFeatured: 'on' };
        }
        const products = await db("products")
            .select("*").where(filterData)
        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching products",
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.query;
        const product = await db("products").where({ id }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        } else {
            res.json({ success: true, data: product });
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const relatedProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      console.warn("No slug provided in req.params:", req.params);
      return res.status(400).json({ success: false, message: "Missing product slug" });
    }

    const product = await db("products")
      .where("slug", slug)
      .select("related_products")
      .first();

    if (!product || !product.related_products) {
      return res.json({ success: true, data: [] });
    }
    console.log("Fetched product for related products:", product.related_products.products);
    const relatedSkus = product.related_products.products
      .map((sku) => sku.trim())
      .filter((sku) => sku); 


    const relatedProducts = await db("products")
      .whereIn("sku", relatedSkus)
      .select("*");

    return res.json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching related products",
    });
  }
};

export const updateProduct = async (req, res) => {
    try {
    const { id } = req.query;
    const {
      name,
      category_id,
      price,
      SKU,
      description,
      specification,
      variant,
      related_products,
      quantity,
      isFeatured,
      active_status,
    } = req.body;

    const product = await db("products").where({ id }).first();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let oldImages = [];
    try{
        oldImages = product.image? JSON.parse(product.image) : [];
        if (!Array.isArray(oldImages)) {
            oldImages = [oldImages];
        }
     } catch (e) {
    oldImages = product.image ? [product.image] : [];
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
        newImages = req.files.map((file) => "/uploads/" + file.filename);
    } else if (req.file) {
        newImages = ["/uploads/" + req.file.filename];
    }

    const imageValue = JSON.stringify([...oldImages, ...newImages]);

    const parsedDescription = typeof description === "string" ? JSON.parse(description) : description ||product.description;
    const parsedSpecification = typeof specification === "string" ? JSON.parse(specification) : specification || product.specification;
    const parsedVariant = typeof variant === "string" ? JSON.parse(variant) : variant || product.variant;
    const parsedRelated_products= typeof related_products === "string" ? JSON.parse(related_products) : related_products || product.related_products;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (price !== undefined) updateData.price = price;
    if (SKU !== undefined) updateData.SKU = SKU;
    if (imageValue !== undefined) updateData.image = imageValue;
    if (description !== undefined) updateData.description = JSON.stringify(parsedDescription);
    if (specification !== undefined) updateData.specification = JSON.stringify(parsedSpecification);
    if (variant !== undefined) updateData.variant = JSON.stringify(parsedVariant);
    if (related_products !== undefined) updateData.related_products = JSON.stringify(parsedRelated_products);
    if (quantity !== undefined) updateData.quantity = quantity;
    if (isFeatured !== undefined) {
    updateData.isFeatured = isFeatured ? "on" : "off";
    }
    if (active_status !== undefined) {
    updateData.active_status = active_status ? "on" : "off";
    }

    await db("products").where({ id }).update(updateData);

    const updatedProduct = await db("products").where({ id }).first();

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await db("products").where ({ slug }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        } else {
            res.json({ success: true, data: product });
        }
    } catch (error) {
        console.error("Error fetching product by slug:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const productStatus = async (req, res) => {
    try {
        const {id } = req.params;
        const {active_status} = req.body;
        const product = await db("products").where({ id }).first();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await db("products").where({ id }).update({ active_status });
        res.json({ success: true, message: "Product status updated successfully" });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};