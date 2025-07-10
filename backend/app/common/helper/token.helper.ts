import jwt from "jsonwebtoken";
import { IUser } from "../../user/user.dto";
import { config } from "dotenv";

config();

interface TokenPayload {
  _id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export const generateTokens = (payload: TokenPayload) => {
  const { ...cleanedPayload } = payload;

  const accessToken = jwt.sign(cleanedPayload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(cleanedPayload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d", // Extend refresh token lifespan
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): IUser | null => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as IUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): IUser | null => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as IUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const refreshAccessToken = (refreshToken: string): string | null => {
  const user = verifyRefreshToken(refreshToken);
  if (user) {
    return generateTokens(user).accessToken;
  }
  return null;
};

const RESET_PASSWORD_SECRET = process.env.RESET_PASSWORD_SECRET || "your-secret-key";

export const generateResetToken = (userId: string): string => {
  return jwt.sign({ userId }, RESET_PASSWORD_SECRET, { expiresIn: "1h" });
};

export const verifyResetToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, RESET_PASSWORD_SECRET) as { userId: string };
    return decoded.userId;
  } catch (err) {
    return null;
  }
};
