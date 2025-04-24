-- AlterTable
ALTER TABLE "workout_type" ADD COLUMN     "is_critical_force" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_max_iso_fs" BOOLEAN NOT NULL DEFAULT false;
