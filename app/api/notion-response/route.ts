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

    // Helper para calcular el score ponderado de forma segura
    const getWeightedScore = (properties: any, name: string) => {
      const score70 = properties[`Score ${name} 70`]?.number || 0;
      const score30 = properties[`Score ${name} 30`]?.number || 0;
      
      // LOG TEMPORAL para 'Eficiencia'
      if (name === 'Eficiencia') {
        console.log(`DEBUG Eficiencia: Score ${name} 70 = ${score70}, Score ${name} 30 = ${score30}`);
      }

      return Math.round((score70 * 0.7) + (score30 * 0.3));
    };

    // Extraer y calcular los scores finales usando los nombres de propiedad correctos
    const userScores = {
      scoreCalidad: getWeightedScore(page.properties, 'Calidad'),
      scoreRelevancia: getWeightedScore(page.properties, 'Relevancia'),
      scoreIdentidad: getWeightedScore(page.properties, 'Identidad'),
      scoreConsistencia: getWeightedScore(page.properties, 'Consistencia'),
      scoreAdopcion: getWeightedScore(page.properties, 'Adopcion'),
      scoreValores: getWeightedScore(page.properties, 'Valor'), // Corregido a 'Valor'
      scoreConveniencia: getWeightedScore(page.properties, 'Conveniencia'),
      scoreEficienciaExp: getWeightedScore(page.properties, 'Eficiencia'), // Corregido a 'Eficiencia'
      scoreFamiliaridad: getWeightedScore(page.properties, 'Familiaridad'),
      scoreReconocimiento: getWeightedScore(page.properties, 'Reconocimiento'),
    };

    // Extraer info adicional (usando 'title' para el nombre y 'Fecha Submission')
    const nombre = page.properties['Nombre']?.title?.[0]?.text?.content || '';
    const fecha = page.properties['Fecha Submission']?.date?.start || '';

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
