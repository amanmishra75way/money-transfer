import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../user/user.schema";
import { createResponse } from "../helper/response.hepler";

export interface IRequestUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  balance: Number;
  role: "USER" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  user?: IRequestUser;
}

export const authMiddleware2 = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Fallback to accessToken cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json(createResponse(null, "Not authorized, token missing"));
      return;
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;

    const user = await UserModel.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
      res.status(401).json(createResponse(null, "User not found"));
      return;
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
    };

    next();
  } catch (error) {
    console.log("ERROR IS ", error);

    res.status(401).json(createResponse(null, "Token invalid or expired"));
  }
};

// For backward compatibility
export const authenticate = authMiddleware2;
