import { authMiddleware } from "./../common/middleware/auth.middleware";
import express from "express";
import {
  requestTransaction,
  getAllTransactions,
  getUserTransactions,
  getTransactionById,
  approveTransaction,
} from "./transaction.controller";
import { authenticate } from "../common/middleware/auth.middleware";
import { isAdmin } from "../common/middleware/AdminCheck.middleware";

const router = express.Router();

router.post("/", authenticate, requestTransaction);
router.get("/user", authenticate, getUserTransactions);
router.get("/admin", authenticate, isAdmin, getAllTransactions);
router.get("/:id", authenticate, getTransactionById);
router.put("/:id/approve", authenticate, isAdmin, approveTransaction);

export default router;
