import jwt from "jsonwebtoken";
import asyncHander from "express-async-handler";

const authorizationToken = asyncHander(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    if (!token) {
      res.status(403);
      throw new Error("token not found");
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      res.status(403);
      throw new Error("invalid token");
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      stack: error.stack,
    });
  }
});

export default authorizationToken;
