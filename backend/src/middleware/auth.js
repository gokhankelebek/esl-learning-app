const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    console.log("Auth middleware - Headers:", req.headers);

    if (!authHeader) {
      console.log("No authorization header found");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Check if it's a Bearer token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    console.log("Token received:", token.slice(0, 20) + "...");

    // Check if it's a temporary token
    if (token.startsWith("temp_token_")) {
      // For temporary tokens, create a guest user object
      req.user = {
        id: token,
        name: "Guest User",
        email: "guest@example.com",
        role: "guest",
      };
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.warn("Auth middleware error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};
