/*
  Warnings:

  - Added the required column `measurement_rate` to the `measurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "measurement" ADD COLUMN     "measurement_rate" INTEGER NOT NULL;
