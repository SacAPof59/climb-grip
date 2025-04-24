import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../prisma';
import { authOptions } from '@/authOptions';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '5');

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's climber profile
    const climber = await prisma.climber.findUnique({
      where: { userId: session.user.id },
    });

    if (!climber) {
      return NextResponse.json({ error: 'Climber profile not found' }, { status: 404 });
    }

    // Get paginated workouts for this user
    const workouts = await prisma.workout.findMany({
      where: { climberId: climber.id },
      include: {
        measurements: {
          include: {
            measuredData: true,
            maxIsoFS: true, // Add this to include MaxIsoFingerStrength data
          },
        },
        workoutType: {
          include: {
            workoutTypeSequences: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Process the data to match WorkoutResultCard expected format
    const workoutResults = workouts.map(workout => {
      // Group measuredData by sequence
      const measurementsData: Array<{
        sequence: number;
        data: Array<{
          sequence: number;
          iteration: number;
          weight: number;
          timestamp: number;
        }>;
      }> = [];

      // Process each measurement
      workout.measurements.forEach(measurement => {
        if (measurement.measuredData.length > 0) {
          const data = measurement.measuredData.map(dataPoint => ({
            sequence: measurement.sequence,
            iteration: dataPoint.iteration,
            weight: dataPoint.weight,
            timestamp: dataPoint.iteration * (1000 / measurement.measurementRate), // Approximate timestamp
          }));

          measurementsData.push({
            sequence: measurement.sequence,
            data,
          });
        }
      });

      // Find max weight across all measured data
      const maxWeight = Math.max(
        0,
        ...workout.measurements.flatMap(m => m.measuredData.map(d => d.weight))
      );

      let maxIsoForce = 0;
      workout.measurements.forEach(measurement => {
        // First check if maxIsoFS exists and has a valid maxForce value
        const currentForce = measurement.maxIsoFS?.maxForce ?? 0;
        if (currentForce > maxIsoForce) {
          maxIsoForce = currentForce;
        }
      });

      return {
        workoutId: workout.id,
        workoutName: workout.workoutName,
        createdAt: workout.createdAt,
        measurementsData,
        workoutSequences: workout.workoutType.workoutTypeSequences,
        maxWeight,
        maxIsoForce: workout.workoutType.isMaxIsoFS ? maxIsoForce : undefined,
      };
    });

    return NextResponse.json({ workoutResults });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { workoutName, measurementsData, bodyWeight } = data;

    // Get the user's climber profile
    const climber = await prisma.climber.findUnique({
      where: { userId: session.user.id },
    });

    if (!climber) {
      return NextResponse.json({ error: 'Climber profile not found' }, { status: 404 });
    }

    // Get workout type to access sequence information
    const workoutType = await prisma.workoutType.findUnique({
      where: { name: workoutName },
      include: {
        workoutTypeSequences: true,
      },
    });

    if (!workoutType) {
      return NextResponse.json({ error: 'Workout type not found' }, { status: 404 });
    }

    // Create the workout record
    const workout = await prisma.workout.create({
      data: {
        workoutName,
        climberId: climber.id,
        bodyWeight,
      },
    });

    // Process each measurement sequence and create MaxIsoFingerStrength records if needed
    const measurementPromises = workoutType.workoutTypeSequences.map(async sequence => {
      // Find the corresponding measurement data if it exists
      const sequenceData =
        measurementsData.find((m: { sequence: number }) => m.sequence === sequence.sequence)
          ?.data || [];

      // Create measurement record
      const measurement = await prisma.measurement.create({
        data: {
          workoutId: workout.id,
          sequence: sequence.sequence,
          sequenceType: sequence.sequenceType,
          duration: sequence.duration,
          measurementRate: 10, // 10Hz as specified
          currentRepetition: 1, // Default to 1 if not specified
        },
      });

      // If this sequence records force and we have data, save it
      if (sequence.recordForce && sequenceData.length > 0) {
        // Create measured data records
        await prisma.measuredData.createMany({
          data: sequenceData.map((item: { weight: number }, idx: number) => ({
            measurementId: measurement.id,
            iteration: idx,
            weight: item.weight,
          })),
        });

        // Calculate and store max isometric strength if needed
        if (workoutType.isMaxIsoFS) {
          // Calculate average/mean of the weight
          const sum = sequenceData.reduce(
            (acc: number, point: { weight: number }) => acc + point.weight,
            0
          );
          const avgForce = sequenceData.length > 0 ? sum / sequenceData.length : 0;

          // Create MaxIsoFingerStrength record
          await prisma.maxIsoFingerStrength.create({
            data: {
              measurementId: measurement.id,
              maxForce: avgForce,
            },
          });
        }
      }

      return measurement;
    });

    await Promise.all(measurementPromises);

    return NextResponse.json({ success: true, workoutId: workout.id });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
