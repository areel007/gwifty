"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../controllers/auth");
const auth_2 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.route("/register").post(auth_1.register);
router.route("/login").post(auth_1.login);
router.route("/verify").post(auth_2.authenticate, auth_1.verififyEmail);
router.route("/send-code").post(auth_2.authenticate, auth_1.sendConfirmationEmail);
router.route("/refresh-token").post(auth_2.authenticate, auth_1.refresh);
router.route("/me").get(auth_2.authenticate, (0, auth_2.authorize)("user", "admin"), auth_1.checkAuth);
router.route("/logout").post(auth_2.authenticate, (0, auth_2.authorize)("user", "admin"), auth_1.logout);
router.route("/send-code").post(auth_2.authenticate, auth_1.sendCode);
router.route("/forgot-password").post(auth_1.sendResetPasswordEmail);
router.route("/reset-password").post(auth_1.resetPassword);
router
    .route("/change-password")
    .patch(auth_2.authenticate, (0, auth_2.authorize)("user", "admin"), auth_1.changePassword);
exports.default = router;
