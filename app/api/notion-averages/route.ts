import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '9ba6f361-af85-45a0-8e2a-62b77cae404d';

function mapScoreToPercentage(score: number): number {
  if (score >= 100) return 100;
  if (score >= 75) return 75;
  if (score >= 50) return 50;
  return 25;
}

async function getAllResponses() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
    });

    return response.results.map((page: any) => ({
      scoreCalidad: mapScoreToPercentage(page.properties['Score Calidad']?.number || 0),
      scoreRelevancia: mapScoreToPercentage(page.properties['Score Relevancia']?.number || 0),
      scoreIdentidad: mapScoreToPercentage(page.properties['Score Identidad']?.number || 0),
      scoreConsistencia: mapScoreToPercentage(page.properties['Score Consistencia']?.number || 0),
      scoreAdopcion: mapScoreToPercentage(page.properties['Score Adopción']?.number || 0),
      scoreValores: mapScoreToPercentage(page.properties['Score Valores']?.number || 0),
      scoreConveniencia: mapScoreToPercentage(page.properties['Score Conveniencia']?.number || 0),
      scoreEficienciaExp: mapScoreToPercentage(page.properties['Score Eficiencia Exp']?.number || 0),
      scoreFamiliaridad: mapScoreToPercentage(page.properties['Score Familiaridad']?.number || 0),
      scoreReconocimiento: mapScoreToPercentage(page.properties['Score Reconocimiento']?.number || 0),
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