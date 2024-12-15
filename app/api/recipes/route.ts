import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RecipeRequestBody = {
  title: string;
  images: any;
  ingredients: any;
  instructions: any;
  userId: number;
};

export async function POST(request: Request) {
  try {
    const body: RecipeRequestBody = await request.json();

    const { title, images, ingredients, instructions, userId } = body;

    if (!title || !images || !ingredients || !instructions || isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'Missing required fields or incorrect format' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        images,
        ingredients,
        instructions,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe created successfully',
      data: { recipeId: recipe.id.toString() },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', data: error }, { status: 500 });
  }
}