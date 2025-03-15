-- CreateTable
CREATE TABLE "timer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "workout_id" TEXT,

    CONSTRAINT "timer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timer_step" (
    "timer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rest_duration" INTEGER NOT NULL,
    "repetition" INTEGER NOT NULL,

    CONSTRAINT "timer_step_pkey" PRIMARY KEY ("timer_id","name")
);

-- CreateTable
CREATE TABLE "timer_exercise" (
    "timer_step_timer_id" TEXT NOT NULL,
    "timer_step_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "rest_duration" INTEGER NOT NULL,
    "repetition" INTEGER NOT NULL,

    CONSTRAINT "timer_exercise_pkey" PRIMARY KEY ("timer_step_timer_id","timer_step_name","name")
);

-- CreateIndex
CREATE UNIQUE INDEX "timer_workout_id_key" ON "timer"("workout_id");

-- AddForeignKey
ALTER TABLE "timer" ADD CONSTRAINT "timer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timer" ADD CONSTRAINT "timer_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timer_step" ADD CONSTRAINT "timer_step_timer_id_fkey" FOREIGN KEY ("timer_id") REFERENCES "timer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timer_exercise" ADD CONSTRAINT "timer_exercise_timer_step_timer_id_timer_step_name_fkey" FOREIGN KEY ("timer_step_timer_id", "timer_step_name") REFERENCES "timer_step"("timer_id", "name") ON DELETE CASCADE ON UPDATE CASCADE;
