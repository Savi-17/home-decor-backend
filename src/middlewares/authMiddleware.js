import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.split(" ")[0] !== 'Bearer') {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];
  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //`+*37Q@a?+h#pUaQ7y#e%vbM`
    req.user = decoded;
    next();
  } catch (err) {
    console.log("err",err)
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;