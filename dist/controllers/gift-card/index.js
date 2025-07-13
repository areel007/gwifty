"use strict";
// import { Request, Response } from "express";
// import multer from "multer";
// import cloudinary from "../../services/cloudinary";
// import { PrismaClient } from "@prisma/client";
// import streamifier from "streamifier";
// import prisma from "../../lib/prisma";
// export const createGiftCard = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { type, amount, currency, code } = req.body;
//     if (!req.file) {
//       res.status(400).json({ error: "Image file is required" });
//       return;
//     }
//     const imageUrl: string = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { folder: "cryptowise/giftcards" },
//         (error, result) => {
//           if (error) return reject(error);
//           if (result?.secure_url) resolve(result.secure_url);
//           else reject(new Error("Cloudinary upload failed"));
//         }
//       );
//       streamifier.createReadStream(req.file!.buffer).pipe(uploadStream);
//     });
//     const giftCard = await prisma.giftCard.create({
//       data: {
//         type,
//         amount: parseFloat(amount),
//         currency,
//         code,
//         imageUrl,
//         sellerId: req.user.id,
//       },
//     });
//     res.status(201).json(giftCard);
//   } catch (error) {
//     console.error("❌ Error creating gift card:", error);
//     res.status(500).json({ error: "Failed to create gift card" });
//   }
// };
// export const getGiftCards = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const giftCards = await prisma.giftCard.findMany({
//       //   where: { sellerId: req.user.id },
//       orderBy: { createdAt: "desc" },
//     });
//     res.status(200).json(giftCards);
//   } catch (error) {
//     console.error("❌ Error fetching gift cards:", error);
//     res.status(500).json({ error: "Failed to fetch gift cards" });
//   }
// };
// export const getGiftCardsBySeller = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const giftCards = await prisma.giftCard.findMany({
//       where: { sellerId: req.user.id },
//       orderBy: { createdAt: "desc" },
//     });
//     res.status(200).json(giftCards);
//   } catch (error) {
//     console.error("❌ Error fetching gift cards by seller:", error);
//     res.status(500).json({ error: "Failed to fetch gift cards by seller" });
//   }
// };
// export const deleteCard = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const giftCard = await prisma.giftCard.findUnique({
//       where: { id },
//     });
//     if (!giftCard) {
//       res.status(404).json({ error: "Gift card not found" });
//       return;
//     }
//     // delete image from Cloudinary
//     if (giftCard.imageUrl) {
//       // Extract public_id from the imageUrl
//       const publicIdMatch = giftCard.imageUrl.match(
//         /cryptowise\/giftcards\/([^\.\/]+)/
//       );
//       const publicId = publicIdMatch
//         ? `cryptowise/giftcards/${publicIdMatch[1]}`
//         : null;
//       if (publicId) {
//         try {
//           await cloudinary.uploader.destroy(publicId);
//         } catch (err) {
//           console.warn("⚠️ Failed to delete image from Cloudinary:", err);
//         }
//       }
//     }
//     await prisma.giftCard.delete({
//       where: { id },
//     });
//     res.status(200).json({ message: "Gift card deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting gift card:", error);
//     res.status(500).json({ error: "Failed to delete gift card" });
//   }
// };
// export const getSellerOfAGiftCard = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const giftCard = await prisma.giftCard.findUnique({
//       where: { id },
//       select: {
//         seller: {
//           select: {
//             id: true,
//             username: true,
//             email: true,
//           },
//         },
//       },
//     });
//     if (!giftCard) {
//       res.status(404).json({ error: "Gift card not found" });
//       return;
//     }
//     res.status(200).json(giftCard.seller);
//   } catch (error) {
//     console.error("❌ Error fetching seller of gift card:", error);
//     res.status(500).json({ error: "Failed to fetch seller of gift card" });
//   }
// };
