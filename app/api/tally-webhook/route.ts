import { NextRequest, NextResponse } from 'next/server';
import { saveResult } from '@/lib/resultsCache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n========================================');
    console.log('🎯 WEBHOOK RECIBIDO DE TALLY');
    console.log('========================================');

    // Extraer datos de Tally
    const tallyData = body.data?.fields || body.fields || body;

    // Extraer TODOS los IDs que Tally envía
    const eventId = body.eventId;
    const responseId = body.data?.responseId;
    const submissionId = body.data?.submissionId;
    const respondentId = body.data?.respondentId;

    console.log('🔑 IDs recibidos de Tally:');
    console.log(`   - eventId: ${eventId}`);
    console.log(`   - responseId: ${responseId}`);
    console.log(`   - submissionId: ${submissionId}`);
    console.log(`   - respondentId: ${respondentId}`);

    // Usar el responseId como principal (es el que usa {{response_id}} en Tally)
    const submission_id = responseId || submissionId || eventId || Date.now().toString();

    // Convertir array de fields a objeto key-value para facilitar búsqueda
    const fieldsMap = new Map<string, any>();

    if (Array.isArray(tallyData)) {
      tallyData.forEach((field: any) => {
        fieldsMap.set(field.key, field);
      });
    }

    console.log(`📋 Usando Submission ID principal: ${submission_id}`);
    console.log(`📊 Total de campos recibidos: ${fieldsMap.size}`);

    // Extraer nombre
    const nombreField = tallyData.find((f: any) => f.label === 'Nombre');
    const nombre = nombreField?.value || 'Usuario';

    // Encontrar los campos calculados por Tally (tipo CALCULATED_FIELDS)
    // Estos ya vienen con la ponderación 70%/30% aplicada
    const calculatedFields = tallyData.filter((f: any) => f.type === 'CALCULATED_FIELDS');

    console.log(`\n🔢 Campos calculados encontrados: ${calculatedFields.length}`);

    // Mapear los scores calculados por pilar
    const scoresMap: { [key: string]: { q70: number; q30: number } } = {
      'Calidad y eficiencia': { q70: 0, q30: 0 },
      'Relevancia': { q70: 0, q30: 0 },
      'Identidad': { q70: 0, q30: 0 },
      'Consistencia': { q70: 0, q30: 0 },
      'Adopción': { q70: 0, q30: 0 },
      'Valores e impacto': { q70: 0, q30: 0 },
      'Conveniencia': { q70: 0, q30: 0 },
      'Eficiencia en la experiencia': { q70: 0, q30: 0 },
      'Familiaridad': { q70: 0, q30: 0 },
      'Reconocimiento': { q70: 0, q30: 0 },
    };

    // Extraer scores de los campos calculados
    console.log('\n🔍 DEBUG - Campos calculados recibidos:');
    calculatedFields.forEach((field: any) => {
      console.log(`   ${field.label} = ${field.value}`);
    });

    calculatedFields.forEach((field: any) => {
      const label = field.label;
      const value = field.value || 0;

      // Determinar el pilar y si es 70% o 30%
      for (const pilar of Object.keys(scoresMap)) {
        if (label.includes(pilar)) {
          if (label.includes('(70%)')) {
            scoresMap[pilar].q70 = value;
          } else if (label.includes('(30%)')) {
            scoresMap[pilar].q30 = value;
          }
          break;
        }
      }
    });

    console.log('\n📊 Scores extraídos de Tally:');
    Object.entries(scoresMap).forEach(([pilar, scores]) => {
      const total = scores.q70 + scores.q30;
      console.log(`   ${pilar}: 70%=${scores.q70}, 30%=${scores.q30}, SUMA=${total}`);
    });

    // Calcular scores finales (sumar 70% + 30%)
    // Tally ya envía los valores calculados, solo necesitamos sumarlos
    const finalScores = {
      scoreCalidad: scoresMap['Calidad y eficiencia'].q70 + scoresMap['Calidad y eficiencia'].q30,
      scoreRelevancia: scoresMap['Relevancia'].q70 + scoresMap['Relevancia'].q30,
      scoreIdentidad: scoresMap['Identidad'].q70 + scoresMap['Identidad'].q30,
      scoreConsistencia: scoresMap['Consistencia'].q70 + scoresMap['Consistencia'].q30,
      scoreAdopcion: scoresMap['Adopción'].q70 + scoresMap['Adopción'].q30,
      scoreValores: scoresMap['Valores e impacto'].q70 + scoresMap['Valores e impacto'].q30,
      scoreConveniencia: scoresMap['Conveniencia'].q70 + scoresMap['Conveniencia'].q30,
      scoreEficienciaExp: scoresMap['Eficiencia en la experiencia'].q70 + scoresMap['Eficiencia en la experiencia'].q30,
      scoreFamiliaridad: scoresMap['Familiaridad'].q70 + scoresMap['Familiaridad'].q30,
      scoreReconocimiento: scoresMap['Reconocimiento'].q70 + scoresMap['Reconocimiento'].q30,
    };

    console.log('\n✅ Scores finales calculados:');
    Object.entries(finalScores).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Preparar objeto de resultado
    const resultData = {
      submission_id,
      nombre,
      scores: finalScores,
      timestamp: Date.now(),
    };

    // Guardar resultados en caché con TODOS los IDs posibles
    // Esto asegura que sin importar qué variable use Tally, se encontrarán los datos
    const idsToSave = [submission_id, responseId, submissionId, respondentId, eventId].filter(Boolean);

    console.log(`💾 Guardando resultados con ${idsToSave.length} IDs diferentes:`);
    idsToSave.forEach(id => {
      if (id) {
        saveResult(id, resultData);
        console.log(`   ✓ Guardado con ID: ${id}`);
      }
    });

    console.log('========================================\n');

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Datos procesados y guardados exitosamente',
      submission_id,
      nombre,
      scores: finalScores,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error: any) {
    console.error('\n❌ ERROR EN WEBHOOK:');
    console.error('========================================');
    console.error(error);
    console.error('========================================\n');

    return NextResponse.json({
      success: false,
      error: 'Error al procesar el webhook',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

// GET endpoint para debugging/testing
export async function GET() {
  return NextResponse.json({
    message: 'Tally Webhook Endpoint - Simplified (No Notion)',
    instructions: 'Send POST requests with Tally form data. Scores are extracted from CALCULATED_FIELDS.',
    note: 'Tally debe tener campos calculados con formato: "Nombre del Pilar (70%)" y "Nombre del Pilar (30%)"',
  });
}
