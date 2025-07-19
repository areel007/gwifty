"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const trade = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["AMAZON", "STEAM", "APPLE", "GOOGLE_PAY", "NETFLIX"],
    },
    amount: {
        type: Number,
    },
    seller: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "CANCELLED"],
        default: "PENDING",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = (0, mongoose_1.model)("Trade", trade);
