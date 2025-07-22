"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewAllTrades = exports.updateTradeStatus = exports.viewTrades = exports.InitiateTrade = void 0;
const email_service_1 = require("../../services/email_service");
const csvPath = require("path").resolve(process.cwd(), "trades.csv");
const trade_1 = __importDefault(require("../../models/trade"));
const InitiateTrade = async (req, res) => {
    try {
        const { name, whatsappNumber, email, type, amount } = req.body;
        const seller = req.user.id;
        // write card into a csv file in the root folder
        const fs = await Promise.resolve().then(() => __importStar(require("fs")));
        const path = await Promise.resolve().then(() => __importStar(require("path")));
        const csvLine = `${name},${whatsappNumber},${email},${type},${amount},${new Date().toISOString()}\n`;
        const csvPath = path.resolve(process.cwd(), "trades.csv");
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, "name,whatsapp,email,type,amount,createdAt\n");
        }
        fs.appendFileSync(csvPath, csvLine);
        const csvBuffer = fs.readFileSync(csvPath);
        await (0, email_service_1.sendTradeNotification)(whatsappNumber, process.env.EMAIL_ADDRESS, process.env.EMAIL_PASSWORD, [
            {
                filename: "trades.csv",
                content: csvBuffer,
            },
        ]);
        await trade_1.default.create({
            type: type,
            amount,
            seller,
            username: name,
        });
        res.status(201).json({
            message: "Trade initiated successfully",
        });
    }
    catch (error) {
        console.error("Error initiating trade:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.InitiateTrade = InitiateTrade;
const viewTrades = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!sellerId) {
            res.status(400).json({ message: "Seller ID is required" });
            return;
        }
        const trades = await trade_1.default.find({ seller: sellerId });
        res.status(200).json(trades);
    }
    catch (error) {
        console.error("Error viewing trades:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.viewTrades = viewTrades;
const updateTradeStatus = async (req, res) => {
    try {
        const tradeId = req.params.tradeId;
        const { status } = req.body;
        const trade = await trade_1.default.findByIdAndUpdate(tradeId, { status }, { new: true });
        res.status(200).json(trade);
    }
    catch (error) {
        console.error("Error updating trade status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateTradeStatus = updateTradeStatus;
const viewAllTrades = async (req, res) => {
    const trades = await trade_1.default.find();
    if (!trades || trades.length === 0) {
        res.status(200).json(trades);
        return;
    }
    res.status(200).json(trades);
};
exports.viewAllTrades = viewAllTrades;
