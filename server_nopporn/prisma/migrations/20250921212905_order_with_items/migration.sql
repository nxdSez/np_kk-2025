/*
  Warnings:

  - You are about to drop the column `role` on the `order` table. All the data in the column will be lost.
  - You are about to drop the `productonorder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `productonorder` DROP FOREIGN KEY `ProductOnOrder_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `productonorder` DROP FOREIGN KEY `ProductOnOrder_productId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `role`,
    MODIFY `total` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `stripePaymentId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `productonorder`;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
