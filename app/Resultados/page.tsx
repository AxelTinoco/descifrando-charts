'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RadarScoreChart from '@/components/RadarScoreChart';

interface Scores {
  scoreCalidad: number;
  scoreRelevancia: number;
  scoreIdentidad: number;
  scoreConsistencia: number;
  scoreAdopcion: number;
  scoreValores: number;
  scoreConveniencia: number;
  scoreEficienciaExp: number;
  scoreFamiliaridad: number;
  scoreReconocimiento: number;
}

type ScoreKey = keyof Scores;

const scoreLabels: Record<ScoreKey, string> = {
  scoreCalidad: 'Calidad',
  scoreRelevancia: 'Relevancia',
  scoreIdentidad: 'Identidad',
  scoreConsistencia: 'Consistencia',
  scoreAdopcion: 'Adopción',
  scoreValores: 'Valores',
  scoreConveniencia: 'Conveniencia',
  scoreEficienciaExp: 'Eficiencia',
  scoreFamiliaridad: 'Familiaridad',
  scoreReconocimiento: 'Reconocimiento',
};

export default function Resultados() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userScores, setUserScores] = useState<Scores | null>(null);
  const [averageScores, setAverageScores] = useState<Scores | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    // Obtener los scores del usuario desde los query params de Tally
    const score_calidad = searchParams.get('score_calidad');
    const score_relevancia = searchParams.get('score_relevancia');
    const score_identidad = searchParams.get('score_identidad');
    const score_consistencia = searchParams.get('score_consistencia');
    const score_adopcion = searchParams.get('score_adopcion');
    const score_valores = searchParams.get('score_valores');
    const score_conveniencia = searchParams.get('score_conveniencia');
    const score_eficiencia_exp = searchParams.get('score_eficiencia_exp');
    const score_familiaridad = searchParams.get('score_familiaridad');
    const score_reconocimiento = searchParams.get('score_reconocimiento');

    if (score_calidad) {
      // Mapear los valores de Tally a porcentajes
      // Tally envía valores 0-10, convertimos a 25%, 50%, 75%, 100%
      const mapScoreToPercentage = (score: string | null): number => {
        const numScore = parseFloat(score || '0');
        if (numScore >= 8) return 100;  // 8-10 = 100%
        if (numScore >= 5) return 75;   // 5-7 = 75%
        if (numScore >= 3) return 50;   // 3-4 = 50%
        return 25;                       // 0-2 = 25%
      };

      setUserScores({
        scoreCalidad: mapScoreToPercentage(score_calidad),
        scoreRelevancia: mapScoreToPercentage(score_relevancia),
        scoreIdentidad: mapScoreToPercentage(score_identidad),
        scoreConsistencia: mapScoreToPercentage(score_consistencia),
        scoreAdopcion: mapScoreToPercentage(score_adopcion),
        scoreValores: mapScoreToPercentage(score_valores),
        scoreConveniencia: mapScoreToPercentage(score_conveniencia),
        scoreEficienciaExp: mapScoreToPercentage(score_eficiencia_exp),
        scoreFamiliaridad: mapScoreToPercentage(score_familiaridad),
        scoreReconocimiento: mapScoreToPercentage(score_reconocimiento),
      });

      // Fetch de los promedios desde Notion
      fetchAverageScores();
    } else {
      // Si no hay parámetros, mostrar datos de ejemplo
      setUserScores({
        scoreCalidad: 75,
        scoreRelevancia: 50,
        scoreIdentidad: 75,
        scoreConsistencia: 100,
        scoreAdopcion: 50,
        scoreValores: 75,
        scoreConveniencia: 75,
        scoreEficienciaExp: 75,
        scoreFamiliaridad: 100,
        scoreReconocimiento: 75,
      });
      fetchAverageScores();
    }
  }, [searchParams]);

  const fetchAverageScores = async () => {
    try {
      const response = await fetch('/api/notion-averages');
      const data = await response.json();

      setAverageScores(data.averages);
      setTotalResponses(data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching averages:', error);
      // Usar datos de ejemplo si falla
      setAverageScores({
        scoreCalidad: 68,
        scoreRelevancia: 62,
        scoreIdentidad: 70,
        scoreConsistencia: 75,
        scoreAdopcion: 58,
        scoreValores: 72,
        scoreConveniencia: 65,
        scoreEficienciaExp: 70,
        scoreFamiliaridad: 78,
        scoreReconocimiento: 73,
      });
      setTotalResponses(100);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Generando tus resultados...</p>
        </div>
      </div>
    );
  }

  if (!userScores) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            No se encontraron resultados
          </h1>
          <p className="text-gray-600">
            Por favor, completa el formulario primero para ver tus resultados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¡Gracias por completar el Quiz!
          </h1>
          <p className="text-xl text-gray-600">
            Aquí están tus resultados comparados con {totalResponses} respuestas
          </p>
        </div>

        {/* Gráfica Principal */}
        <RadarScoreChart
          userScores={userScores}
          averageScores={averageScores}
          showComparison={true}
        />

        {/* Insights y Recomendaciones */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fortalezas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">💪</div>
              <h3 className="text-2xl font-bold text-gray-800">Fortalezas</h3>
            </div>
            <ul className="space-y-2">
              {Object.entries(userScores)
                .filter(([_, score]) => score >= 75)
                .map(([key, score]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">
                        {scoreLabels[key as ScoreKey]} ({score}%)
                      </span>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Oportunidades */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📈</div>
              <h3 className="text-2xl font-bold text-gray-800">Oportunidades</h3>
            </div>
            <ul className="space-y-2">
              {Object.entries(userScores)
                .filter(([_, score]) => score <= 50)
                .map(([key, score]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className="text-yellow-500 text-xl">→</span>
                      <span className="text-gray-700">
                        {scoreLabels[key as ScoreKey]} ({score}%)
                      </span>
                    </li>
                  ))}
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Qué sigue?</h2>
          <p className="text-lg mb-6 text-purple-100">
            Basándonos en tus resultados, te recomendamos enfocarte en mejorar
            las áreas con menor puntuación para fortalecer tu conexión con la marca.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition">
              Descargar Resultados (PDF)
            </button>
            <button className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition">
              Compartir en Redes
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>Resultados generados el {new Date().toLocaleDateString('es-MX')}</p>
          <p className="mt-2 text-sm">
            Basado en {totalResponses} respuestas · Quiz de Lealtad de Marca
          </p>
        </div>
      </div>
    </div>
  );
}
