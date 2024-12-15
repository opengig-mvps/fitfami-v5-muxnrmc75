import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
    }

    const userProfile = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User profile fetched successfully',
      data: {
        id: userProfile.id,
        email: userProfile.email,
        username: userProfile.username,
        name: userProfile.name,
        role: userProfile.role,
        createdAt: userProfile.createdAt.toISOString(),
        updatedAt: userProfile.updatedAt.toISOString(),
        profile: userProfile.profile ? {
          bio: userProfile.profile.bio,
          profilePicture: userProfile.profile.profilePicture,
          createdAt: userProfile.profile.createdAt.toISOString(),
          updatedAt: userProfile.profile.updatedAt.toISOString(),
        } : null,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', data: error }, { status: 500 });
  }
}