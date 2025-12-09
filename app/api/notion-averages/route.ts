import { NextResponse } from 'next/server';

// Formatear el ID con guiones si no los tiene (formato UUID)
function formatNotionId(id: string): string {
  if (id.includes('-')) return id;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

const DATABASE_ID = formatNotionId(process.env.NOTION_DATABASE_ID || '');
const NOTION_API_KEY = process.env.NOTION_API_KEY || '';

async function getAllResponses() {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();

    // Extraer scores directamente desde Notion (sin bucketing)
    // Los scores ya vienen calculados con la ponderación 70%/30%
    return data.results.map((page: any) => ({
      scoreCalidad: Math.round(page.properties['Calidad y eficiencia']?.number || 0),
      scoreRelevancia: Math.round(page.properties['Relevancia']?.number || 0),
      scoreIdentidad: Math.round(page.properties['Identidad']?.number || 0),
      scoreConsistencia: Math.round(page.properties['Consistencia']?.number || 0),
      scoreAdopcion: Math.round(page.properties['Adopción']?.number || 0),
      scoreValores: Math.round(page.properties['Valores e impacto']?.number || 0),
      scoreConveniencia: Math.round(page.properties['Conveniencia']?.number || 0),
      scoreEficienciaExp: Math.round(page.properties['Eficiencia en la experiencia']?.number || 0),
      scoreFamiliaridad: Math.round(page.properties['Familiaridad']?.number || 0),
      scoreReconocimiento: Math.round(page.properties['Reconocimiento']?.number || 0),
    }));
  } catch (error) {
    console.error('Error fetching from Notion:', error);
    throw error;
  }
}

function calculateAverages(responses: any[]) {
  if (responses.length === 0) {
    return null;
  }

  const total = responses.length;
  
  const averages = {
    scoreCalidad: 0,
    scoreRelevancia: 0,
    scoreIdentidad: 0,
    scoreConsistencia: 0,
    scoreAdopcion: 0,
    scoreValores: 0,
    scoreConveniencia: 0,
    scoreEficienciaExp: 0,
    scoreFamiliaridad: 0,
    scoreReconocimiento: 0,
  };

  // Sumar todos los scores
  responses.forEach(response => {
    Object.keys(averages).forEach(key => {
      averages[key as keyof typeof averages] += response[key];
    });
  });

  // Calcular promedio y redondear
  Object.keys(averages).forEach(key => {
    averages[key as keyof typeof averages] = Math.round(
      averages[key as keyof typeof averages] / total
    );
  });

  return averages;
}

export async function GET() {
  try {
    // Obtener todas las respuestas
    const responses = await getAllResponses();
    
    // Calcular promedios
    const averages = calculateAverages(responses);

    // Retornar datos
    return NextResponse.json({
      success: true,
      total: responses.length,
      averages,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('API Error:', error);
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
