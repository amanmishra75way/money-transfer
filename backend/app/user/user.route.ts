import { Router } from "express";
import * as userController from "./user.controller";
import * as userValidation from "./user.validation";
import { authMiddleware } from "../common/middleware/auth.middleware";
import { catchError } from "../common/middleware/cath-error.middleware";

const router = Router();

router.post("/register", userValidation.createUser, catchError, userController.registerUserHandler);

router.post("/login", userValidation.loginUser, catchError, userController.loginUserHandler);

router.get("/profile", authMiddleware, userController.getUserProfileHandler);

router.put("/profile", authMiddleware, userValidation.updateUser, catchError, userController.updateUserProfileHandler);

router.post("/logout", authMiddleware, catchError, userController.logoutUserHandler);

router.post("/forgot-password", userValidation.forgotPassword, catchError, userController.forgotPasswordHandler);

router.post("/reset-password", userValidation.resetPassword, catchError, userController.resetPasswordHandler);

router.post(
  "/change-password",
  authMiddleware,
  userValidation.changePassword,
  catchError,
  userController.changePasswordHandler
);

router.post("/refresh-token", userController.refreshTokenHandler);

export default router;
