import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { sendTradeNotification } from "../../services/email_service";
const csvPath = require("path").resolve(process.cwd(), "trades.csv");
import Trade from "../../models/trade";

export const InitiateTrade = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, whatsappNumber, email, type, amount } = req.body;
    const seller = req.user.id;

    // write card into a csv file in the root folder
    const fs = await import("fs");
    const path = await import("path");
    const csvLine = `${name},${whatsappNumber},${email},${type},${amount},${new Date().toISOString()}\n`;
    const csvPath = path.resolve(process.cwd(), "trades.csv");
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, "name,whatsapp,email,type,amount,createdAt\n");
    }
    fs.appendFileSync(csvPath, csvLine);

    const csvBuffer = fs.readFileSync(csvPath);

    await sendTradeNotification(
      whatsappNumber,
      process.env.EMAIL_ADDRESS!,
      process.env.EMAIL_PASSWORD!,
      [
        {
          filename: "trades.csv",
          content: csvBuffer,
        },
      ]
    );

    await Trade.create({
      type: type,
      amount,
      seller,
      username: name,
    });

    res.status(201).json({
      message: "Trade initiated successfully",
    });
  } catch (error) {
    console.error("Error initiating trade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const viewTrades = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      res.status(400).json({ message: "Seller ID is required" });
      return;
    }

    const trades = await Trade.find({ seller: sellerId });

    res.status(200).json(trades);
  } catch (error) {
    console.error("Error viewing trades:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTradeStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tradeId = req.params.tradeId;
    const { status } = req.body;
    const trade = await Trade.findByIdAndUpdate(
      tradeId,
      { status },
      { new: true }
    );

    res.status(200).json(trade);
  } catch (error) {
    console.error("Error updating trade status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const viewAllTrades = async (req: Request, res: Response) => {
  const trades = await Trade.find();
  if (!trades || trades.length === 0) {
    res.status(200).json(trades);
    return;
  }
  res.status(200).json(trades);
};
