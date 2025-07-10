import { Response, NextFunction } from "express";
import { createResponse } from "../helper/response.hepler";
import { AuthenticatedRequest } from "./auth.middleware2";

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json(createResponse(null, "User not authenticated"));
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json(createResponse(null, "Admin access required"));
    return;
  }

  next();
};
