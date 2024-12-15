import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const userId = parseInt(request.headers.get('userId') || '', 10);
    const recipeId = parseInt(params.recipeId, 10);

    if (isNaN(userId) || isNaN(recipeId)) {
      return NextResponse.json({ success: false, message: 'Invalid user or recipe ID' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }

    const like = await prisma.like.create({
      data: {
        userId,
        recipeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Like added successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error adding like:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', data: error }, { status: 500 });
  }
}