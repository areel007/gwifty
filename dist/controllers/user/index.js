"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../../models/user"));
const getUsers = async (req, res) => {
    try {
        const users = await user_1.default.find();
        res.status(200).json(users.map((user) => {
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                role: user.role,
            };
        }));
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            role: user.role,
            isVerified: user.isVerified,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
exports.getUser = getUser;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await user_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        await user_1.default.deleteOne({ _id: userId });
        // await prisma.trade.deleteMany({ where: { sellerId: userId } });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
