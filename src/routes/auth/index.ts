import { Router } from "express";
import {
  checkAuth,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  sendCode,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  verififyEmail,
  changePassword,
} from "../../controllers/auth";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verify").post(authenticate, verififyEmail);
router.route("/send-code").post(authenticate, sendConfirmationEmail);
router.route("/refresh-token").post(authenticate, refresh);
router.route("/me").get(authenticate, authorize("user", "admin"), checkAuth);
router.route("/logout").post(authenticate, authorize("user", "admin"), logout);
router.route("/send-code").post(authenticate, sendCode);
router.route("/forgot-password").post(sendResetPasswordEmail);
router.route("/reset-password").post(resetPassword);
router
  .route("/change-password")
  .patch(authenticate, authorize("user", "admin"), changePassword);

export default router;
