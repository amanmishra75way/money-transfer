import { type BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
  id: string;
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  role: "USER" | "ADMIN";
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  balance: Number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  refreshToken?: string;
  active?: boolean;
  role?: "USER" | "ADMIN";
  resetToken?: string | null;
}

export interface LoginUserDto {
  email: string;
  password: string;
}
