/*
  Warnings:

  - The values [OTHER] on the enum `GiftCardType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GiftCardType_new" AS ENUM ('AMAZON', 'STEAM', 'APPLE', 'GOOGLE_PLAY', 'NETFLIX');
ALTER TABLE "GiftCard" ALTER COLUMN "type" TYPE "GiftCardType_new" USING ("type"::text::"GiftCardType_new");
ALTER TYPE "GiftCardType" RENAME TO "GiftCardType_old";
ALTER TYPE "GiftCardType_new" RENAME TO "GiftCardType";
DROP TYPE "GiftCardType_old";
COMMIT;
