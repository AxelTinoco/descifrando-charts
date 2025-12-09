import { NextRequest, NextResponse } from 'next/server';
import { getResult } from '@/lib/resultsCache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const submission_id = searchParams.get('submission_id');

  if (!submission_id) {
    return NextResponse.json(
      { success: false, error: 'Se requiere submission_id' },
      { status: 400 }
    );
  }

  try {
    const result = getResult(submission_id);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontraron resultados',
          message: 'Los resultados pueden tardar unos segundos en procesarse. Por favor, espera un momento e intenta de nuevo.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error('Error al obtener resultados:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los resultados',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
