"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user")); // adjust path as needed
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        // ✅ verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // ✅ check if payload contains id
        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }
        // ✅ fetch user from database
        const user = await user_1.default.findById(decoded.id);
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        // ✅ attach user to request and proceed
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role.toLowerCase())) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    next();
};
exports.authorize = authorize;
