/*
  Warnings:

  - You are about to drop the column `price` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `enable` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `productcart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productorder` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `customerId` on table `cart` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerId` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productcart` DROP FOREIGN KEY `ProductCart_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `productcart` DROP FOREIGN KEY `ProductCart_productId_fkey`;

-- DropForeignKey
ALTER TABLE `productorder` DROP FOREIGN KEY `ProductOrder_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `productorder` DROP FOREIGN KEY `ProductOrder_productId_fkey`;

-- DropIndex
DROP INDEX `Cart_customerId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Order_customerId_fkey` ON `order`;

-- DropIndex
DROP INDEX `Order_productId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `cart` MODIFY `customerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `price`,
    DROP COLUMN `productId`,
    DROP COLUMN `quantity`,
    ADD COLUMN `role` ENUM('USER', 'ADMIN', 'EMPLOYEE') NOT NULL DEFAULT 'USER',
    MODIFY `customerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `enable`,
    DROP COLUMN `role`,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `productcart`;

-- DropTable
DROP TABLE `productorder`;

-- CreateTable
CREATE TABLE `ProductOnOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `count` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductOnCart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `count` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOnOrder` ADD CONSTRAINT `ProductOnOrder_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOnOrder` ADD CONSTRAINT `ProductOnOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOnCart` ADD CONSTRAINT `ProductOnCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOnCart` ADD CONSTRAINT `ProductOnCart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
