/*
  Warnings:

  - You are about to drop the `GiftCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GiftCard" DROP CONSTRAINT "GiftCard_sellerId_fkey";

-- DropTable
DROP TABLE "GiftCard";
