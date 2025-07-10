import { body, param } from "express-validator";

export const createTransaction = [
  body("toId").notEmpty().withMessage("Recipient ID is required").isMongoId().withMessage("Invalid recipient ID"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => {
      if (value <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return true;
    }),
  body("type")
    .notEmpty()
    .withMessage("Transaction type is required")
    .isIn(["transfer", "deposit", "withdrawal", "payment"])
    .withMessage("Invalid transaction type"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("isInternational").optional().isBoolean().withMessage("isInternational must be a boolean"),
];

export const approveTransaction = [
  param("id").notEmpty().withMessage("Transaction ID is required").isMongoId().withMessage("Invalid transaction ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["approved", "rejected", "completed"])
    .withMessage("Invalid status"),
  body("remarks")
    .optional()
    .isString()
    .withMessage("Remarks must be a string")
    .isLength({ max: 1000 })
    .withMessage("Remarks must not exceed 1000 characters"),
];

export const getTransactionById = [
  param("id").notEmpty().withMessage("Transaction ID is required").isMongoId().withMessage("Invalid transaction ID"),
];
