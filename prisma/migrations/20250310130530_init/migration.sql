-- CreateEnum
CREATE TYPE "SequenceType" AS ENUM ('EFFORT', 'REST');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climber" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "alias" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "height" DOUBLE PRECISION,
    "span" DOUBLE PRECISION,
    "route_grade" TEXT,
    "boulder_grade" TEXT,

    CONSTRAINT "climber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_type" (
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "workout_type_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "workout_type_sequence" (
    "workout_name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "sequence_type" "SequenceType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "instruction" TEXT,

    CONSTRAINT "workout_type_sequence_pkey" PRIMARY KEY ("workout_name","sequence")
);

-- CreateTable
CREATE TABLE "workout" (
    "id" TEXT NOT NULL,
    "workout_name" TEXT NOT NULL,
    "climber_id" TEXT NOT NULL,
    "body_weight" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_device" (
    "id" TEXT NOT NULL,

    CONSTRAINT "measurement_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calibration" (
    "device_id" TEXT NOT NULL,
    "session" INTEGER NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "sensor_value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calibration_pkey" PRIMARY KEY ("device_id","session")
);

-- CreateTable
CREATE TABLE "measurement" (
    "id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "sequence_type" "SequenceType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "measurement_device_id" TEXT,
    "current_repetition" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measured_data" (
    "measurement_id" TEXT NOT NULL,
    "iteration" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "measured_data_pkey" PRIMARY KEY ("measurement_id","iteration")
);

-- CreateTable
CREATE TABLE "max_iso_finger_strength_workout" (
    "id" TEXT NOT NULL,
    "measurement_id" TEXT NOT NULL,
    "max_force" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "max_iso_finger_strength_workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_force_workout" (
    "id" TEXT NOT NULL,
    "measurement_id" TEXT NOT NULL,
    "critical_force" DOUBLE PRECISION NOT NULL,
    "w_prime" DOUBLE PRECISION NOT NULL,
    "max_force" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "critical_force_workout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "climber_user_id_key" ON "climber"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "max_iso_finger_strength_workout_measurement_id_key" ON "max_iso_finger_strength_workout"("measurement_id");

-- CreateIndex
CREATE UNIQUE INDEX "critical_force_workout_measurement_id_key" ON "critical_force_workout"("measurement_id");

-- AddForeignKey
ALTER TABLE "climber" ADD CONSTRAINT "climber_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_type_sequence" ADD CONSTRAINT "workout_type_sequence_workout_name_fkey" FOREIGN KEY ("workout_name") REFERENCES "workout_type"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout" ADD CONSTRAINT "workout_climber_id_fkey" FOREIGN KEY ("climber_id") REFERENCES "climber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout" ADD CONSTRAINT "workout_workout_name_fkey" FOREIGN KEY ("workout_name") REFERENCES "workout_type"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibration" ADD CONSTRAINT "calibration_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "measurement_device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement" ADD CONSTRAINT "measurement_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement" ADD CONSTRAINT "measurement_measurement_device_id_fkey" FOREIGN KEY ("measurement_device_id") REFERENCES "measurement_device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measured_data" ADD CONSTRAINT "measured_data_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "max_iso_finger_strength_workout" ADD CONSTRAINT "max_iso_finger_strength_workout_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_force_workout" ADD CONSTRAINT "critical_force_workout_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
