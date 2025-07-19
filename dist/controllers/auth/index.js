"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.sendResetPasswordEmail = exports.sendCode = exports.logout = exports.checkAuth = exports.sendConfirmationEmail = exports.refresh = exports.login = exports.verififyEmail = exports.register = void 0;
// import prisma from "../../lib/prisma";
const user_1 = __importDefault(require("../../models/user"));
const hash_password_1 = require("../../utils/hash_password");
const jwt_1 = require("../../utils/jwt");
// import { Role } from "@prisma/client";
const email_service_1 = require("../../services/email_service");
const verification_code_1 = require("../../utils/verification_code");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// Temporary store for refresh tokens (use DB in production)
let refreshTokens = [];
// register user
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // const verificationCode = generateVerificationCode();
        if (!username || username.length < 3) {
            res
                .status(400)
                .json({ error: "Username must be at least 3 characters long" });
            return;
        }
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const existingUser = await user_1.default.findOne({ $or: [{ email }, { username }] });
        // const existingUser = await prisma.user.findFirst({
        //   where: {
        //     OR: [{ email }, { username }],
        //   },
        // });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        const hashedPassword = await (0, hash_password_1.hashPassword)(password);
        // Validate role
        // const selectedRole =
        //   role && Object.values(Role).includes(role) ? role : Role.USER;
        const user = await user_1.default.create({
            username,
            email,
            password: hashedPassword,
            role: "USER",
            isVerified: false,
        });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.register = register;
// verify user email
const verififyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.verificationCode !== verificationCode) {
            res.status(400).json({ error: "Invalid verification code" });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ error: "User already verified" });
            return;
        }
        if (user.verificationExpiresAt < new Date()) {
            res.status(400).json({ error: "Verification code expired" });
            return;
        }
        await user_1.default.findOneAndUpdate({ email }, { isVerified: true, verificationCode: null, verificationExpiresAt: null });
        res.status(200).json({ message: "Email verified successfully" });
    }
    catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.verififyEmail = verififyEmail;
// login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Invalid email or password" });
            return;
        }
        const isPasswordValid = await (0, hash_password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(404).json({ message: "Invalid email or password" });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user?._id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "20m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user?._id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "1h",
        });
        refreshTokens.push(refreshToken);
        const userWithoutPassword = {
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            role: user.role,
            isVerified: user.isVerified,
        };
        res
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        })
            .status(200)
            .json({ ...userWithoutPassword, accessToken }); // ✅ Only return access token
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        res.status(401).json({ error: "Refresh token is required" });
        return;
    }
    if (!refreshTokens.includes(token)) {
        res.status(403).json({ error: "Invalid refresh token" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: "Invalid refresh token" });
        const userId = user.userId;
        const accessToken = (0, jwt_1.generateAccessToken)(userId.toString());
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(userId.toString());
        // Replace old refresh token
        const index = refreshTokens.indexOf(token);
        if (index !== -1)
            refreshTokens.splice(index, 1);
        refreshTokens.push(newRefreshToken);
        res
            .cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        })
            .status(200)
            .json({ accessToken }); // ✅ Only return access token
    });
};
exports.refresh = refresh;
const sendConfirmationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ error: "User already verified" });
            return;
        }
        const verificationCode = (0, verification_code_1.generateVerificationCode)();
        await user_1.default.findOneAndUpdate({ email }, {
            verificationCode,
            verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await (0, email_service_1.sendConfirmation)(user.email, verificationCode, process.env.EMAIL_ADDRESS, process.env.EMAIL_PASSWORD);
        res.status(200).json({ message: "Confirmation code sent to your email" });
    }
    catch (error) {
        console.error("Error sending confirmation email:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.sendConfirmationEmail = sendConfirmationEmail;
const checkAuth = (req, res) => {
    try {
        const user = req.user; // Assuming user is set by the authentication middleware
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error checking authentication:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.checkAuth = checkAuth;
const logout = (req, res) => {
    res.sendStatus(204);
};
exports.logout = logout;
const sendCode = async (req, res) => {
    try {
        const { email } = req.body;
        const verificationCode = (0, verification_code_1.generateVerificationCode)();
        const user = await user_1.default.findOne({ email });
        await user_1.default.findOneAndUpdate({ email }, {
            verificationCode,
            verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        (0, email_service_1.sendConfirmation)(email, verificationCode, process.env.EMAIL_ADDRESS, process.env.EMAIL_PASSWORD);
        res
            .status(200)
            .json({ message: "code successfully send.", code: verificationCode });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.sendCode = sendCode;
const sendResetPasswordEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // expires in 1 hour
        await user_1.default.findOneAndUpdate({ email }, {
            passwordResetToken: resetToken,
            passwordResetExpiresAt: expiresAt,
        });
        // TODO: Send `resetToken` to user via email. Example link:
        // `https://yourfrontend.com/reset-password?token=${resetToken}`
        const resetLink = `${process.env.CLIENT_URI}/reset-password?token=${resetToken}`;
        (0, email_service_1.sendConfirmation)(email, resetLink, process.env.EMAIL_ADDRESS, process.env.EMAIL_PASSWORD);
        res.json({ message: "Password reset link sent to your email." });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await user_1.default.findOne({
        passwordResetToken: token,
        passwordResetExpiresAt: { $gt: new Date() }, // not expired
    });
    if (!user) {
        res.status(400).json({ message: "Invalid or expired token" });
        return;
    }
    const hashedPassword = await (0, hash_password_1.hashPassword)(newPassword);
    await user_1.default.findOneAndUpdate({ _id: user._id }, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
    });
    res.json({ message: "Password has been reset successfully." });
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user?.id; // Assuming user ID is set in the request
        console.log(userId, oldPassword, newPassword);
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = await user_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isPasswordValid = await (0, hash_password_1.comparePassword)(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: "Old password is incorrect" });
            return;
        }
        const hashedNewPassword = await (0, hash_password_1.hashPassword)(newPassword);
        await user_1.default.findOneAndUpdate({ _id: userId }, {
            password: hashedNewPassword,
        });
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.changePassword = changePassword;
