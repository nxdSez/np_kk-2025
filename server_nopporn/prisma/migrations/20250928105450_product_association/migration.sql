-- CreateTable
CREATE TABLE `ProductAssociation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sourceProductId` INTEGER NOT NULL,
    `targetProductId` INTEGER NOT NULL,
    `weight` INTEGER NOT NULL DEFAULT 1,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productId` INTEGER NULL,

    INDEX `ProductAssociation_sourceProductId_idx`(`sourceProductId`),
    INDEX `ProductAssociation_targetProductId_idx`(`targetProductId`),
    UNIQUE INDEX `ProductAssociation_sourceProductId_targetProductId_key`(`sourceProductId`, `targetProductId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductAssociation` ADD CONSTRAINT `ProductAssociation_sourceProductId_fkey` FOREIGN KEY (`sourceProductId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAssociation` ADD CONSTRAINT `ProductAssociation_targetProductId_fkey` FOREIGN KEY (`targetProductId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductAssociation` ADD CONSTRAINT `ProductAssociation_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
