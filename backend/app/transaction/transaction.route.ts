import { authMiddleware2 } from "./../common/middleware/auth.middleware2";
import { Router } from "express";
import * as transactionController from "./transaction.controller";
import * as transactionValidation from "./transaction.validation";
import { isAdmin } from "../common/middleware/admin.middleware";
import { catchError } from "../common/middleware/cath-error.middleware";

const router = Router();

// User routes
router.post(
  "/request",
  authMiddleware2,
  transactionValidation.createTransaction,
  catchError,
  transactionController.requestTransaction
);

router.get("/my-transactions", authMiddleware2, transactionController.getUserTransactions);

router.get("/stats", authMiddleware2, transactionController.getTransactionStats);

router.get(
  "/:id",
  authMiddleware2,
  transactionValidation.getTransactionById,
  catchError,
  transactionController.getTransactionById
);

// Admin routes
router.get("/admin/all", authMiddleware2, isAdmin, transactionController.getAllTransactions);

router.get("/admin/pending", authMiddleware2, isAdmin, transactionController.getPendingTransactions);

router.put(
  "/:id/approve",
  authMiddleware2,
  isAdmin,
  transactionValidation.approveTransaction,
  catchError,
  transactionController.approveTransaction
);

export default router;
