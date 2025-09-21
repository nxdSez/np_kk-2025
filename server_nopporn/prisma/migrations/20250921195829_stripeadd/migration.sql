/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripePaymentId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `stripePaymentId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_stripePaymentId_key` ON `Order`(`stripePaymentId`);
