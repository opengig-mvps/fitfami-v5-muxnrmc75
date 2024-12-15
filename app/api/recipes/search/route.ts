import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';

    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            ingredients: {
              array_contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        images: true,
        ingredients: true,
        instructions: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Recipes fetched successfully',
      data: recipes,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}