/*
  Warnings:

  - You are about to drop the column `orderedById` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `orderedById` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_orderedById_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_orderedById_fkey`;

-- DropIndex
DROP INDEX `Cart_orderedById_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Order_orderedById_fkey` ON `order`;

-- AlterTable
ALTER TABLE `cart` DROP COLUMN `orderedById`,
    ADD COLUMN `customerId` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `currency`,
    DROP COLUMN `orderedById`,
    ADD COLUMN `customerId` INTEGER NOT NULL DEFAULT 1,
    MODIFY `orderStatus` VARCHAR(191) NOT NULL DEFAULT 'รอตรวจสอบ';

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
