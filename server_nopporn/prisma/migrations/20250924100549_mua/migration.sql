/*
  Warnings:

  - You are about to drop the column `createdAt` on the `orderitem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orderitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;
