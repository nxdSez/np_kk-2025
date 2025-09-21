/*
  Warnings:

  - You are about to drop the column `stripePaymentId` on the `order` table. All the data in the column will be lost.
  - Added the required column `paymentIntent` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Order_stripePaymentId_key` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `stripePaymentId`,
    ADD COLUMN `paymentIntent` VARCHAR(191) NOT NULL;
