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
          },
        },
        workoutType: {
          include: {
            workoutTypeSequences: true,
          },
        },
        MaxIsoFingerStrength: true,
        CriticalForceWorkout: true,
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
      const measurementsData = workout.measurements.map(measurement => ({
        sequence: measurement.sequence,
        data: measurement.measuredData.map(dataPoint => ({
          sequence: measurement.sequence,
          iteration: dataPoint.iteration,
          weight: dataPoint.weight,
          timestamp: dataPoint.iteration * (1000 / measurement.measurementRate), // Approximate timestamp
        })),
      }));

      // Find max weight across all measured data or use the stored maxWeight values
      const maxWeight = Math.max(0, ...workout.measurements.map(m => m.maxWeight || 0));

      return {
        workoutId: workout.id,
        workoutName: workout.workoutName,
        createdAt: workout.createdAt,
        measurementsData,
        workoutSequences: workout.workoutType.workoutTypeSequences,
        maxWeight,
        bodyWeight: workout.bodyWeight || 0,
        maxIsoForce: workout.MaxIsoFingerStrength?.maxForce,
        criticalForce: workout.CriticalForceWorkout?.criticalForce,
        maxForceForCF: workout.CriticalForceWorkout?.maxForce,
        // wPrime is ignored for now as per requirements
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

    // Process each measurement sequence
    const measurementPromises = workoutType.workoutTypeSequences.map(async sequence => {
      // Find the corresponding measurement data if it exists
      const sequenceData =
        measurementsData.find((m: { sequence: number }) => m.sequence === sequence.sequence)
          ?.data || [];

      // Calculate average and max weight for this sequence
      let averageWeight = null;
      let maxWeight = null;

      if (sequenceData.length > 0) {
        const weights = sequenceData.map((item: { weight: number }) => item.weight);
        averageWeight = weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length;
        maxWeight = Math.max(...weights);
      }

      // Create measurement record
      const measurement = await prisma.measurement.create({
        data: {
          workoutId: workout.id,
          sequence: sequence.sequence,
          sequenceType: sequence.sequenceType,
          duration: sequence.duration,
          measurementRate: 10, // 10Hz as specified
          currentRepetition: 1, // Default to 1 if not specified
          averageWeight,
          maxWeight,
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
      }

      return measurement;
    });

    const measurements = await Promise.all(measurementPromises);

    // Process the MaxIsoFS and CriticalForce data at the workout level
    if (workoutType.isMaxIsoFS || workoutType.isCriticalForce) {
      // Get all EFFORT measurements ordered by sequence
      const effortMeasurements = measurements
        .filter(m => m.sequenceType === 'EFFORT')
        .sort((a, b) => a.sequence - b.sequence);

      // For MaxIsoFS, calculate maxForce from the first 3 EFFORT sequences
      if (workoutType.isMaxIsoFS && effortMeasurements.length > 0) {
        const firstThreeEfforts = effortMeasurements.slice(0, 3);
        const validAverages = firstThreeEfforts
          .filter(m => m.averageWeight !== null)
          .map(m => m.averageWeight as number);

        if (validAverages.length > 0) {
          const maxForce = Math.max(...validAverages);

          await prisma.maxIsoFingerStrength.create({
            data: {
              workoutId: workout.id,
              maxForce,
            },
          });
        }
      }

      // For CriticalForce, calculate from the last 6 EFFORT sequences
      if (workoutType.isCriticalForce && effortMeasurements.length > 0) {
        // Get first 3 efforts for maxForce (same calculation as MaxIsoFS)
        const firstThreeEfforts = effortMeasurements.slice(0, 3);
        const validAveragesForMax = firstThreeEfforts
          .filter(m => m.averageWeight !== null)
          .map(m => m.averageWeight as number);

        const maxForce = validAveragesForMax.length > 0 ? Math.max(...validAveragesForMax) : 0;

        // Get the last 6 EFFORT sequences from the current workout only
        const lastSixEfforts = effortMeasurements.slice(-6); // Takes the last 6 elements
        const validAveragesForCF = lastSixEfforts
          .filter(m => m.averageWeight !== null)
          .map(m => m.averageWeight as number);

        // Calculate critical force as average of the last 6 effort sequences
        const criticalForce =
          validAveragesForCF.length > 0
            ? validAveragesForCF.reduce((sum, w) => sum + w, 0) / validAveragesForCF.length
            : 0;

        await prisma.criticalForceWorkout.create({
          data: {
            workoutId: workout.id,
            criticalForce,
            maxForce,
            wPrime: 0, // Set to 0 as it's ignored for now
          },
        });
      }
    }

    return NextResponse.json({ success: true, workoutId: workout.id });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
