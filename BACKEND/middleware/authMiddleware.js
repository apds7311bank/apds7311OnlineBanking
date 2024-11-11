/**
 * This code was adapted from the following YouTube tutorials:
 * - Traversy Media, "Node.js & Express From Scratch", available at: https://www.youtube.com/watch?v=0-S5a0eXPoc&t=353s
 * - CodeAcademy, "Build a RESTful API with Node.js, Express, and MongoDB", available at: https://www.youtube.com/watch?v=ZBCUegTZF7M
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  console.log('Request Header:', req.headers);

  const authHeader = req.headers['authorization']; // Fix casing: 'authorization' instead of 'Authorisation'
  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header, access denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Authorization header format must be Bearer [Token]' });
  }

  const token = parts[1];
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ message: 'No token provided, access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded:", decoded);
    req.user = decoded; // Attaches the decoded user info to req.user
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token, access denied' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, access denied' });
    }
    res.status(500).json({ message: 'Server error during authentication', error: err });
  }
};

// Role-checking middleware to verify user roles
export const checkRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: You do not have access' });
};

export default authMiddleware;

