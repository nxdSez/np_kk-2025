-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_customerId_fkey`;

-- DropIndex
DROP INDEX `Cart_customerId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Order_customerId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `cart` MODIFY `customerId` INTEGER NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `order` MODIFY `customerId` INTEGER NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
