import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as userService from "./user.service";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "./user.dto";
import { createResponse } from "../common/helper/response.hepler";
import { generateTokens } from "../common/helper/token.helper";
import { verifyRefreshToken, verifyResetToken, generateResetToken } from "../common/helper/token.helper";
import UserModel from "./user.schema";
import { sendResetPasswordEmail } from "../common/helper/email.helper";
import bcrypt from "bcryptjs";

export const registerUserHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role }: CreateUserDto = req.body;
  const newUser = await userService.createUser({ name, email, password, role });

  const { accessToken, refreshToken } = generateTokens({
    _id: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role,
  });

  // Store the refresh token in the user's record
  await userService.updateUser(newUser._id.toString(), { refreshToken });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(201).send(
    createResponse(
      {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        accessToken,
        refreshToken, // Include refresh token in the response
      },
      "User registered successfully"
    )
  );
});

export const loginUserHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginUserDto = req.body;
  const { user, tokens } = await userService.loginUser({ email, password });

  // Update the refresh token in the database
  await userService.updateUser(user._id.toString(), { refreshToken: tokens.refreshToken });

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.send(
    createResponse(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // Include refresh token in the response
      },
      "User logged in successfully"
    )
  );
});

/**
 * Logs out the current user.
 * @param {Request} req - The HTTP request object containing the refresh token.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>} Sends a response indicating successful logout.
 */
export const logoutUserHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.body?.refreshToken;

  if (!refreshToken) {
    res.status(400).send(createResponse(null, "No refresh token provided"));
    return;
  }

  await userService.logoutUser(refreshToken);

  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });
  res.status(200).send(createResponse(null, "User logged out successfully"));
});

/**
 * Retrieves the profile of the currently authenticated user.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>} Sends a response with the user's profile data.
 */
export const getUserProfileHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).send(createResponse(null, "User not authenticated"));
    return;
  }

  const userId = req.user._id;
  const user = await userService.getUserById(userId);

  res.send(createResponse(user, "User profile retrieved successfully"));
});

/**
 * Updates the profile of the currently authenticated user.
 * @param {Request} req - The HTTP request object containing updated user data.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>} Sends a response with the updated user profile data.
 */
export const updateUserProfileHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).send(createResponse(null, "User not authenticated"));
    return;
  }

  const userId = req.user._id;
  const updateData: UpdateUserDto = req.body;

  const updatedUser = await userService.updateUser(userId, updateData);

  res.send(createResponse(updatedUser, "User profile updated successfully"));
});

export const refreshTokenHandler = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body; // Expect the refresh token in the request body

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is required" });
    return;
  }

  const userPayload = verifyRefreshToken(refreshToken);

  if (!userPayload) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
    return;
  }

  // Find the user and validate stored refresh token
  const user = await UserModel.findById(userPayload._id);
  if (!user || user.refreshToken !== refreshToken) {
    res.status(403).json({ message: "Invalid refresh token" });
    return;
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save();

  // Optionally, set the new refresh token as a cookie (can be removed if unnecessary)
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ accessToken, refreshToken: newRefreshToken });
};

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404).send(createResponse(null, "User not found"));
    return;
  }

  const resetToken = generateResetToken(user._id); // Create this helper
  await userService.updateUser(user._id.toString(), { resetToken });

  await sendResetPasswordEmail(user.email, resetToken); // Create this helper

  res.status(200).send(createResponse(null, "Reset password email sent"));
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  const userId = verifyResetToken(token); // Validate and extract user ID from the token
  if (!userId) {
    res.status(400).send(createResponse(null, "Invalid or expired reset token"));
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userService.updateUser(userId, { password: hashedPassword, resetToken: null });

  res.status(200).send(createResponse(null, "Password reset successfully"));
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).send(createResponse(null, "User not authenticated"));
    return;
  }

  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  await userService.changePassword(userId, currentPassword, newPassword);

  res.status(200).send(createResponse(null, "Password changed successfully"));
});
