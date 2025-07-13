import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { sendTradeNotification } from "../../services/email_service";
const csvPath = require("path").resolve(process.cwd(), "trades.csv");

export const InitiateTrade = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, whatsappNumber, email, type, amount, sellerId } = req.body;

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

    await prisma.trade.create({
      data: {
        type: type,
        amount,
        sellerId,
        username: name,
      },
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

    const trades = await prisma.trade.findMany({
      where: {
        sellerId: sellerId,
      },
    });

    res.status(200).json(trades);
  } catch (error) {
    console.error("Error viewing trade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTradeStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tradeId } = req.params;
    const { status } = req.body;
    const trade = await prisma.trade.update({
      where: { id: tradeId },
      data: { status },
    });
    res.status(200).json(trade);
  } catch (error) {
    console.error("Error updating trade status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const viewAllTrades = async (req: Request, res: Response) => {
  const trades = await prisma.trade.findMany();
  if (!trades || trades.length === 0) {
    res.status(200).json(trades);
    return;
  }
  res.status(200).json(trades);
};
