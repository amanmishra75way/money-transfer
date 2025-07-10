import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import TransactionModel from "../../transaction/transaction.schema";

interface IRequestUser {
  id: string;
  role: "USER" | "ADMIN";
}

const verifyTransactionAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const transactionId = req.params.id;

  const user = req.user as IRequestUser | undefined;

  if (!user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  const transaction = await TransactionModel.findById(transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  const isOwner = transaction.fromId.toString() === user.id || transaction.toId.toString() === user.id;

  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("You do not have access to this transaction");
  }

  (req as any).transaction = transaction;

  next();
});

export default verifyTransactionAccess;
