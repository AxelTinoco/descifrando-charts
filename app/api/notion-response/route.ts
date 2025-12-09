import { NextRequest, NextResponse } from 'next/server';

// Formatear el ID con guiones si no los tiene (formato UUID)
function formatNotionId(id: string): string {
  if (id.includes('-')) return id;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

const DATABASE_ID = formatNotionId(process.env.NOTION_DATABASE_ID || '');
const NOTION_API_KEY = process.env.NOTION_API_KEY || '';

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
    // Usar fetch directamente con la API de Notion
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28', // Versión estable de la API
      },
      body: JSON.stringify({
        filter: {
          property: 'Respondent ID',
          rich_text: {
            equals: submission_id
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al consultar Notion',
          message: errorData.message,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontró la respuesta' },
        { status: 404 }
      );
    }

    const page: any = data.results[0];

    // Extraer los scores directamente desde Notion (sin bucketing)
    // Los scores ya vienen calculados con la ponderación 70%/30%
    const userScores = {
      scoreCalidad: Math.round(page.properties['Score Calidad']?.number || 0),
      scoreRelevancia: Math.round(page.properties['Score Relevancia']?.number || 0),
      scoreIdentidad: Math.round(page.properties['Score Identidad']?.number || 0),
      scoreConsistencia: Math.round(page.properties['Score Consistencia']?.number || 0),
      scoreAdopcion: Math.round(page.properties['Score Adopción']?.number || 0),
      scoreValores: Math.round(page.properties['Score Valores']?.number || 0),
      scoreConveniencia: Math.round(page.properties['Score Conveniencia']?.number || 0),
      scoreEficienciaExp: Math.round(page.properties['Score Eficiencia Exp']?.number || 0),
      scoreFamiliaridad: Math.round(page.properties['Score Familiaridad']?.number || 0),
      scoreReconocimiento: Math.round(page.properties['Score Reconocimiento']?.number || 0),
    };

    // Extraer info adicional
    const nombre = page.properties['Nombre']?.rich_text?.[0]?.text?.content || '';
    const fecha = page.properties['Fecha']?.date?.start || '';

    return NextResponse.json({
      success: true,
      submission_id,
      nombre,
      fecha,
      scores: userScores,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching from Notion:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los datos de Notion',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
