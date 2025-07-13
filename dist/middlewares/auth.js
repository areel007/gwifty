"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../lib/prisma"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        req.user = user; // ✅ Attach full user object
        next();
    }
    catch (error) {
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
