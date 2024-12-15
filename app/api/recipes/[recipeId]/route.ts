import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    const recipeId = parseInt(params.recipeId, 10);
    if (isNaN(recipeId)) {
      return NextResponse.json({ success: false, message: 'Invalid recipe ID' }, { status: 400 });
    }

    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId },
      select: {
        id: true,
        title: true,
        images: true,
        ingredients: true,
        instructions: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ success: false, message: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe fetched successfully',
      data: recipe,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', data: error }, { status: 500 });
  }
}