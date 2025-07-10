import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.dto";

const UserSchema: Schema = new Schema<IUser & Document>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    balance: {
      type: Number,
      required: false,
      trim: true,
      default: 0,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
      required: false,
      default: null,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      required: true,
      default: "USER",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser & Document>("User", UserSchema);

export default UserModel;
