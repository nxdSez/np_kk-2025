/*
  Warnings:

  - You are about to drop the column `cartTotal` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `orderStatus` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentId` on the `order` table. All the data in the column will be lost.
  - Added the required column `price` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `cartTotal`,
    DROP COLUMN `orderStatus`,
    DROP COLUMN `stripePaymentId`,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL,
    ALTER COLUMN `customerId` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
