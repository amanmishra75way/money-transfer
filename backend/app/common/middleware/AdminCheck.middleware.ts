import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createResponse } from "../helper/response.hepler";

type UserRole = "ADMIN" | "USER";

interface DecodedToken {
  role: UserRole;
  _id: string;
  email: string;
  name: string;
  exp?: number;
  iat?: number;
}

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get the access token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).send(createResponse(null, "Authentication required"));
      return;
    }

    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Check if the user is an admin
    if (decoded.role !== "ADMIN") {
      res.status(403).send(createResponse(null, "Access denied. Admins only."));
      return;
    }

    // Optionally attach the decoded token to the request for later use
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).send(createResponse(null, "Access token has expired"));
    } else {
      res.status(401).send(createResponse(null, "Invalid access token"));
    }
  }
};
