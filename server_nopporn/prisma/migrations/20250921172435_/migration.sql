/*
  Warnings:

  - You are about to drop the column `amount` on the `order` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `amount`,
    ADD COLUMN `productId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer';
