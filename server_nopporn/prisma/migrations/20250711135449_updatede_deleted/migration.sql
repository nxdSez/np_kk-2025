-- DropForeignKey
ALTER TABLE `productcart` DROP FOREIGN KEY `ProductCart_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `productcart` DROP FOREIGN KEY `ProductCart_productId_fkey`;

-- DropIndex
DROP INDEX `ProductCart_cartId_fkey` ON `productcart`;

-- DropIndex
DROP INDEX `ProductCart_productId_fkey` ON `productcart`;

-- AddForeignKey
ALTER TABLE `ProductCart` ADD CONSTRAINT `ProductCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCart` ADD CONSTRAINT `ProductCart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
