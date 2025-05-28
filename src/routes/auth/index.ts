import { Router } from "express";
import {
  checkAuth,
  login,
  logout,
  refresh,
  register,
  sendConfirmationEmail,
  verififyEmail,
} from "../../controllers/auth";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);
router
  .route("/verify")
  .post(authenticate, authorize("user", "admin"), verififyEmail);
router
  .route("/send-code")
  .post(authenticate, authorize("user", "admin"), sendConfirmationEmail);
router
  .route("/refresh-token")
  .post(authenticate, authorize("user", "admin"), refresh);
router.route("/me").get(authenticate, authorize("user", "admin"), checkAuth);
router.route("/logout").post(authenticate, authorize("user", "admin"), logout);

export default router;
