// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/authOptions';
import { z } from 'zod';
import { prisma } from '../../../../prisma';

// Input validation schema
const profileSchema = z.object({
  alias: z.string().optional().nullable(),
  age: z.number().min(0).max(120).optional().nullable(),
  gender: z.string().optional().nullable(),
  height: z.number().min(0).optional().nullable(),
  span: z.number().min(0).optional().nullable(),
  routeGrade: z.string().optional().nullable(),
  boulderGrade: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { climber: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update or create climber profile
    if (user.climber) {
      // Update existing profile
      await prisma.climber.update({
        where: { id: user.climber.id },
        data: validatedData,
      });
    } else {
      // Create new profile
      await prisma.climber.create({
        data: {
          ...validatedData,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
