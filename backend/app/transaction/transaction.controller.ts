import { Response } from "express";
import asyncHandler from "express-async-handler";
import * as transactionService from "./transaction.service";
import { createResponse } from "../common/helper/response.hepler";
import { ICreateTransactionDTO, IApproveTransactionDTO } from "./transaction.dto";
import { AuthenticatedRequest } from "../common/middleware/auth.middleware2";

export const requestTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json(createResponse(null, "User not authenticated"));
    return;
  }

  const transactionData: ICreateTransactionDTO = req.body;
  const transaction = await transactionService.createTransaction(transactionData, req.user.id);

  res.status(201).json(createResponse(transaction, "Transaction created successfully"));
});

export const getUserTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json(createResponse(null, "User not authenticated"));
    return;
  }

  const transactions = await transactionService.getTransactionsByUser(req.user.id);
  res.status(200).json(createResponse(transactions, "Transactions retrieved successfully"));
});

export const getAllTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transactions = await transactionService.getAllTransactions();
  res.status(200).json(createResponse(transactions, "All transactions retrieved successfully"));
});

export const getTransactionById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const transaction = await transactionService.getTransactionById(id);
  res.status(200).json(createResponse(transaction, "Transaction retrieved successfully"));
});

export const approveTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json(createResponse(null, "User not authenticated"));
    return;
  }

  const { id } = req.params;
  const { status, remarks }: IApproveTransactionDTO = req.body;

  const updatedTransaction = await transactionService.approveTransaction(id, req.user.id, status, remarks);

  res.status(200).json(createResponse(updatedTransaction, "Transaction updated successfully"));
});

export const getPendingTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const transactions = await transactionService.getPendingTransactions();
  res.status(200).json(createResponse(transactions, "Pending transactions retrieved successfully"));
});

export const getTransactionStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.role === "ADMIN" ? undefined : req.user?.id;
  const stats = await transactionService.getTransactionStats(userId);
  res.status(200).json(createResponse(stats, "Transaction statistics retrieved successfully"));
});
