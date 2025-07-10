import { Request, Response } from "express";
import * as transactionService from "./transaction.service";
import asyncHandler from "express-async-handler";

export const requestTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await transactionService.createTransaction(req.body);
  res.status(201).json({ success: true, data: transaction });
});

export const getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const transactions = await transactionService.getTransactionsByUser(userId);
  res.status(200).json({ success: true, data: transactions });
});

export const getAllTransactions = asyncHandler(async (_req: Request, res: Response) => {
  const transactions = await transactionService.getAllTransactions();
  res.status(200).json({ success: true, data: transactions });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await transactionService.getTransactionById(req.params.id);
  res.status(200).json({ success: true, data: transaction });
});

export const approveTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = await transactionService.approveTransaction(req.params.id, req.user.id, status);
  res.status(200).json({ success: true, data: updated });
});
