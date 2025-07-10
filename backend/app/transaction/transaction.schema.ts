// transaction.schema.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  fromId: string;
  toId: string;
  amount: number;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  status: "pending" | "approved" | "rejected" | "completed";
  isInternational: boolean;
  commission: number;
  description?: string;
  processedBy?: string;
  processedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema<ITransaction>(
  {
    fromId: { type: String, required: true, ref: "User" },
    toId: { type: String, required: true, ref: "User" },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["transfer", "deposit", "withdrawal", "payment"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    isInternational: { type: Boolean, default: false },
    commission: { type: Number, default: 0 },
    description: { type: String, default: "" },
    processedBy: { type: String, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

// Pre-save hook to calculate commission
TransactionSchema.pre("save", function (next) {
  if (this.isModified("amount") || this.isModified("isInternational")) {
    this.commission = this.isInternational ? 0.1 * this.amount : 0.02 * this.amount;
  }
  next();
});

const TransactionModel = mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default TransactionModel;
