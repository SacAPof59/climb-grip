/*
  Warnings:

  - You are about to drop the column `measurement_id` on the `critical_force_workout` table. All the data in the column will be lost.
  - You are about to drop the column `measurement_id` on the `max_iso_finger_strength_workout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workout_id]` on the table `critical_force_workout` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workout_id]` on the table `max_iso_finger_strength_workout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workout_id` to the `critical_force_workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workout_id` to the `max_iso_finger_strength_workout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "critical_force_workout" DROP CONSTRAINT "critical_force_workout_measurement_id_fkey";

-- DropForeignKey
ALTER TABLE "max_iso_finger_strength_workout" DROP CONSTRAINT "max_iso_finger_strength_workout_measurement_id_fkey";

-- DropIndex
DROP INDEX "critical_force_workout_measurement_id_key";

-- DropIndex
DROP INDEX "max_iso_finger_strength_workout_measurement_id_key";

-- AlterTable
ALTER TABLE "critical_force_workout" DROP COLUMN "measurement_id",
ADD COLUMN     "workout_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "max_iso_finger_strength_workout" DROP COLUMN "measurement_id",
ADD COLUMN     "workout_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "measurement" ADD COLUMN     "average_weight" DOUBLE PRECISION,
ADD COLUMN     "max_weight" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "critical_force_workout_workout_id_key" ON "critical_force_workout"("workout_id");

-- CreateIndex
CREATE UNIQUE INDEX "max_iso_finger_strength_workout_workout_id_key" ON "max_iso_finger_strength_workout"("workout_id");

-- AddForeignKey
ALTER TABLE "max_iso_finger_strength_workout" ADD CONSTRAINT "max_iso_finger_strength_workout_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_force_workout" ADD CONSTRAINT "critical_force_workout_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
