// transaction.service.ts
import TransactionModel, { ITransaction } from "./transaction.schema";
import UserModel from "../user/user.schema";
import { ITransactionDTO, ICreateTransactionDTO } from "./transaction.dto";
import createHttpError from "http-errors";

export const createTransaction = async (data: ICreateTransactionDTO, fromUserId: string): Promise<ITransaction> => {
  const { toId, amount, type, description, isInternational } = data;

  // Validate users exist
  const fromUser = await UserModel.findById(fromUserId);
  const toUser = await UserModel.findById(toId);

  if (!fromUser) {
    throw createHttpError(404, "Sender user not found");
  }

  if (!toUser) {
    throw createHttpError(404, "Recipient user not found");
  }

  // For transfers and payments, check if sender has sufficient balance
  if ((type === "transfer" || type === "payment") && Number(fromUser.balance) < amount) {
    throw createHttpError(400, "Insufficient balance");
  }

  // Create transaction
  const transaction = new TransactionModel({
    fromId: fromUserId,
    toId,
    amount,
    type,
    description,
    isInternational: isInternational || false,
  });

  await transaction.save();
  return transaction;
};

export const getTransactionsByUser = async (userId: string): Promise<ITransaction[]> => {
  return await TransactionModel.find({
    $or: [{ fromId: userId }, { toId: userId }],
  })
    .populate("fromId", "name email")
    .populate("toId", "name email")
    .sort({ createdAt: -1 });
};

export const getAllTransactions = async (): Promise<ITransaction[]> => {
  return await TransactionModel.find()
    .populate("fromId", "name email")
    .populate("toId", "name email")
    .populate("processedBy", "name email")
    .sort({ createdAt: -1 });
};

export const getTransactionById = async (id: string): Promise<ITransaction | null> => {
  const transaction = await TransactionModel.findById(id)
    .populate("fromId", "name email")
    .populate("toId", "name email")
    .populate("processedBy", "name email");

  if (!transaction) {
    throw createHttpError(404, "Transaction not found");
  }

  return transaction;
};

export const approveTransaction = async (
  id: string,
  processorId: string,
  status: "approved" | "rejected" | "completed",
  remarks?: string
): Promise<ITransaction | null> => {
  const transaction = await TransactionModel.findById(id);

  if (!transaction) {
    throw createHttpError(404, "Transaction not found");
  }

  if (transaction.status !== "pending") {
    throw createHttpError(400, "Transaction has already been processed");
  }

  // Update transaction status
  transaction.status = status;
  transaction.processedBy = processorId;
  transaction.processedAt = new Date();
  if (remarks) transaction.remarks = remarks;

  // If approved, update user balances
  if (status === "approved" || status === "completed") {
    const fromUser = await UserModel.findById(transaction.fromId);
    const toUser = await UserModel.findById(transaction.toId);

    if (!fromUser || !toUser) {
      throw createHttpError(404, "User not found");
    }

    const totalAmount = transaction.amount + transaction.commission;

    // Handle different transaction types
    switch (transaction.type) {
      case "transfer":
      case "payment":
        if (Number(fromUser.balance) < transaction.amount + transaction.commission) {
          throw createHttpError(400, "Insufficient balance");
        }
        fromUser.balance = Number(fromUser.balance) - (transaction.amount + transaction.commission);
        toUser.balance = Number(toUser.balance) + transaction.amount;
        break;

      case "deposit":
        toUser.balance = Number(toUser.balance) + transaction.amount;
        break;

      case "withdrawal":
        if (Number(fromUser.balance) < transaction.amount + transaction.commission) {
          throw createHttpError(400, "Insufficient balance");
        }
        fromUser.balance = Number(fromUser.balance) - (transaction.amount + transaction.commission);
        break;
    }

    await fromUser.save();
    await toUser.save();
  }

  await transaction.save();
  return transaction;
};

export const getPendingTransactions = async (): Promise<ITransaction[]> => {
  return await TransactionModel.find({ status: "pending" })
    .populate("fromId", "name email")
    .populate("toId", "name email")
    .sort({ createdAt: -1 });
};

export const getTransactionStats = async (userId?: string) => {
  const matchCondition = userId ? { $or: [{ fromId: userId }, { toId: userId }] } : {};

  const stats = await TransactionModel.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  return stats;
};
