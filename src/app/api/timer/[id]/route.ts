import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../../prisma';
import { authOptions } from '@/authOptions';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const timer = await prisma.timer.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        steps: {
          include: {
            exercises: true,
          },
        },
      },
    });

    if (!timer) {
      return NextResponse.json({ message: 'Timer not found' }, { status: 404 });
    }

    return NextResponse.json(timer);
  } catch (error) {
    console.error('Error fetching timer:', error);
    return NextResponse.json({ message: 'Failed to fetch timer' }, { status: 500 });
  }
}
