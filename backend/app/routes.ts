import express from "express";
import userRoutes from "./user/user.route";
import transactionRoutes from "./transaction/transaction.route";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/transaction", transactionRoutes);

export default router;
