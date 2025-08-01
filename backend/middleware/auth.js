import jwt from "jsonwebtoken";
import { executeQuery } from "../database/connection.js";

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Auth header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const user = await executeQuery(
      "SELECT id, email, full_name, role, is_active FROM users WHERE id = ? AND is_active = TRUE",
      [decoded.id],
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Admin only middleware
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// User or Admin middleware
export const requireAuth = authenticateToken;

// Optional auth middleware (for routes that work both with and without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await executeQuery(
        "SELECT id, email, full_name, role, is_active FROM users WHERE id = ? AND is_active = TRUE",
        [decoded.id],
      );

      if (user.length > 0) {
        req.user = user[0];
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
