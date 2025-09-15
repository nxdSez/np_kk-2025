/*
  Warnings:

  - You are about to drop the column `carTotal` on the `cart` table. All the data in the column will be lost.
  - Added the required column `cartTotal` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripePaymentId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cart` DROP COLUMN `carTotal`,
    ADD COLUMN `cartTotal` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `stripePaymentId` VARCHAR(191) NOT NULL;
