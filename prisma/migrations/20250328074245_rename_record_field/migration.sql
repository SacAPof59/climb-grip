/*
  Warnings:

  - You are about to drop the column `register_force` on the `workout_type_sequence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workout_type_sequence" DROP COLUMN "register_force",
ADD COLUMN     "record_force" BOOLEAN NOT NULL DEFAULT false;
