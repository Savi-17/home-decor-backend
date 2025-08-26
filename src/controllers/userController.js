import db from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, gender, dob, email, password, contact, pincode } = req.body;
    const existingUser = await db("customers").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const [id] = await db("customers").insert({
      uuid: uuidv4(),
      active_status: 1,
      name,
      gender,
      dob,
      email,
      password: hashedPassword,
      contact,
      pincode,
    });

    res.status(201).json({ message: "User registered successfully", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.query;
    const user = await db("customers").where({ email }).first();

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
     }
     const token = generateToken({ id: user.id, uuid: user.uuid, email: user.email });

     res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let basequery = db("customers");

    if (search) {
      basequery = basequery.where("name", "like", `%${search}%`).orWhere("email", "like", `%${search}%`);
    }

    const totalUsers = await basequery.clone().count("* as count").first();
    const users = await basequery.offset(offset).limit(limit);

    res.json({
      total: totalUsers.count,
      page,
      limit,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
