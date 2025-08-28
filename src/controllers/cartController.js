//Cart: 
//Id, customer_id, product_uuid, quantity, coupons, isStock

// cart:
// Cart list | method: get | purpose: view all cart items (web)
// Cart update quantity | method: patch | purpose: Update product quantity in cart (web
// Cart apply coupon | method: patch | purpose: Apply coupon to cart (web)
//  Cart remove item | method:DELETE | purpose: Remove product from cart (web)
import db from "../config/db.js";

export const addToCart = async (req, res) => {
    try {

        const { customer_id, product_uuid, quantity, coupons } = req.body;
        if ( !customer_id || !product_uuid || !quantity ) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const customer = await db("customers").where({ id: customer_id }).first();
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        const product = await db("products").where({ uuid: product_uuid }).first(); 
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (coupons) {
            const coupon = await db("discount").where({ code: coupons }).first();
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Invalid coupon code" });
            }
        }

        const [ existingCartItem ] = await db("cart").where({customer_id, product_uuid});
        if (existingCartItem) {
            const updateQuantity = existingCartItem.quantity + quantity;
            await db("cart").where({ id: existingCartItem.id }).update({ quantity: updateQuantity });
            return res.status(200).json({ success: true, message: "item quantity updated in cart", id: existingCartItem.id, product_uuid, quantity: updateQuantity });
        } else {
            const [ newCartItemId ] = await db("cart").insert({ customer_id, product_uuid, quantity, coupons, created_at: new Date(), updated_at: new Date() });
            return res.status(201).json({ success: true, message: "item added to cart", id: newCartItemId, product_uuid, quantity });
    }

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCartItems = async (req, res) => {
  try {
    const { customer_id } = req.query;
    if (!customer_id) {
      return res.status(400).json({ success: false, message: "Missing customer_id" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [{ count }] = await db("cart").where({ customer_id }).count("id as count");

    const cartItems = await db("cart").where({ customer_id }).orderBy("created_at", "desc").limit(limit).offset(offset);

    res.json({ success: true,pagination: { total: parseInt(count),page,limit,totalPages: Math.ceil(count / limit),},data: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateCartItem = async (req, res) => {
    try {

        const { Id } = req.params;
        const { quantity, coupons } = req.body;
        if (!Id) {
            return res.status(400).json({ success: false, message: "Missing cart item Id" });
        }
        const cartItem = await db("cart").where({ id: Id }).first();
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }   
        const updateData = {};
        if (quantity !== undefined) updateData.quantity = quantity;
        if (coupons !== undefined) {
            const coupon = await db("discount").where({ code: coupons }).first();
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Invalid coupon code" });
            }
            updateData.coupons = coupons;
        }
        updateData.updated_at = new Date();
        await db("cart").where({ id: Id }).update(updateData);
        res.json({ success: true, message: "Cart item updated", id: Id, ...updateData });

    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const applyCouponToCart = async (req, res) => {
    try {

        const { customer_id } = req.params;
        const { coupons } = req.body;
        if (!customer_id || !coupons) {
            return res.status(400).json({ success: false, message: "Missing customer_id or coupons" });
        }
        const customer = await db("customers").where({ id: customer_id }).first();
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        const coupon = await db("discount").where({ code: coupons }).first();
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }
        await db("cart").where({ customer_id }).update({ coupons, updated_at: new Date() });
        res.json({ success: true, message: "Coupon applied to all cart items", customer_id, coupons });

    } catch (error) {
        console.error("Error applying coupon to cart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeCartItem = async (req, res) => {
    try {

        const { Id } = req.params;
        if (!Id) {
            return res.status(400).json({ success: false, message: "Missing cart item Id" });
        }
        const cartItem = await db("cart").where({ id: Id }).first();
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }   
        await db("cart").where({ id: Id }).del();
        res.json({ success: true, message: "Cart item removed", id: Id });

    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
