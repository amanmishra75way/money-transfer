import TransactionModel from "./transaction.schema";
import { ITransactionDTO } from "./transaction.dto";

export const createTransaction = async (data: ITransactionDTO) => {
  return await TransactionModel.create(data);
};

export const getTransactionsByUser = async (userId: string) => {
  return await TransactionModel.find({
    $or: [{ fromId: userId }, { toId: userId }],
  }).sort({ createdAt: -1 });
};

export const getAllTransactions = async () => {
  return await TransactionModel.find().sort({ createdAt: -1 });
};

export const getTransactionById = async (id: string) => {
  return await TransactionModel.findById(id);
};

export const approveTransaction = async (
  id: string,
  processorId: string,
  status: "approved" | "rejected" | "completed"
) => {
  return await TransactionModel.findByIdAndUpdate(
    id,
    { status, processedBy: processorId, processedAt: new Date() },
    { new: true }
  );
};
