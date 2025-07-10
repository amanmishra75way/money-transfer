import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../helper/token.helper";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token is required" });
  }

  const token = authHeader.split(" ")[1]; 
  const user = verifyAccessToken(token);

  if (!user) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }

  req.user = user; 
  next();
};
