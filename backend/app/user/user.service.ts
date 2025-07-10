import { IUser, CreateUserDto, LoginUserDto, UpdateUserDto } from "./user.dto";
import UserModel from "./user.schema";
import bcrypt from "bcryptjs";
import { generateTokens } from "../common/helper/token.helper";
import createHttpError from "http-errors";

/**
 * Creates a new user.
 * @param {CreateUserDto} userDto - The data transfer object containing user information.
 * @returns {Promise<IUser>} The created user object.
 * @throws {HttpError} Throws an error if the user already exists.
 */
export const createUser = async (userDto: CreateUserDto): Promise<IUser> => {
  const { name, email, password, role } = userDto;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    role,
  });

  await newUser.save();
  return newUser;
};

/**
 * Logs in a user by validating credentials.
 * @param {LoginUserDto} loginDto - The data transfer object containing login credentials.
 * @returns {Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }>} 
 * An object containing the user data and JWT tokens.
 * @throws {HttpError} Throws an error if the credentials are invalid.
 */
export const loginUser = async (loginDto: LoginUserDto) => {
  const { email, password } = loginDto;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    user,
    tokens: { accessToken, refreshToken },
  };
};

/**
 * Updates a user's information.
 * @param {string} userId - The ID of the user to update.
 * @param {UpdateUserDto} updateDto - The data transfer object containing updated user information.
 * @returns {Promise<IUser>} The updated user object.
 * @throws {HttpError} Throws an error if the user is not found.
 */
export const updateUser = async (userId: string, updateDto: UpdateUserDto): Promise<IUser> => {
  const { password, ...rest } = updateDto;

  const updateData: Partial<IUser> = { ...rest };

  // Hash the password if it's being updated
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

  if (!updatedUser) {
    throw createHttpError(404, "User not found");
  }

  return updatedUser;
};

/**
 * Retrieves a user by their ID.
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<IUser | null>} The user object, or null if not found.
 * @throws {HttpError} Throws an error if the user is not found.
 */
export const getUserById = async (userId: string): Promise<IUser | null> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

/**
 * Logs out a user by invalidating their refresh token.
 * @param {string} refreshToken - The refresh token to invalidate.
 * @returns {Promise<void>} Resolves when the refresh token is invalidated.
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  await UserModel.findOneAndUpdate({ refreshToken }, { refreshToken: null });
};


export const updateResetToken = async (userId: string, resetToken: string | null): Promise<void> => {
  await UserModel.findByIdAndUpdate(userId, { resetToken });
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw createHttpError(400, "Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await user.save();
};