-- AlterTable
ALTER TABLE `order` ADD COLUMN `orderDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('pending', 'approved', 'cancelled') NOT NULL DEFAULT 'pending',
    ALTER COLUMN `total` DROP DEFAULT;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `counted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `OrderLineLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerID` VARCHAR(191) NOT NULL,
    `productID` VARCHAR(191) NOT NULL,
    `orderID` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL,
    `frequency` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `customer_product_idx`(`customerID`, `productID`),
    INDEX `order_idx`(`orderID`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
