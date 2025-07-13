/*
  Warnings:

  - You are about to drop the column `buyerId` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `giftCardId` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_giftCardId_fkey";

-- DropIndex
DROP INDEX "Trade_giftCardId_key";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "buyerId",
DROP COLUMN "giftCardId",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ADD COLUMN     "type" "GiftCardType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
