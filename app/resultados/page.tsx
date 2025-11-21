'use client'
import { useState, useEffect, Suspense } from 'react';
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

interface NotionResponse {
  success: boolean;
  submission_id?: string;
  nombre?: string;
  fecha?: string;
  scores?: Scores;
  timestamp?: string;
  error?: string;
  message?: string;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Cargando tus resultados desde Notion...</p>
        <p className="mt-2 text-gray-500 text-sm">Esto puede tomar unos segundos</p>
      </div>
    </div>
  );
}

function ErrorView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {error}
        </h1>
        <p className="text-gray-600 mb-6">
          Es posible que tus datos aún se estén guardando en Notion.
          Por favor, espera un momento e intenta de nuevo.
        </p>
        <button
          onClick={onRetry}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function ResultadosContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userScores, setUserScores] = useState<Scores | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [averageScores, setAverageScores] = useState<Scores | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    const submission_id = searchParams.get('submission_id');

    if (submission_id) {
      loadDataFromNotion(submission_id);
    } else {
      // Modo demo si no hay submission_id
      loadDemoData();
    }
  }, [searchParams]);

  const loadDataFromNotion = async (submissionId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch datos del usuario
      const userResponse = await fetch(`/api/notion-response?submission_id=${submissionId}`);
      const userData: NotionResponse = await userResponse.json();

      if (!userData.success || !userData.scores) {
        setError('No se encontraron tus resultados');
        setLoading(false);
        return;
      }

      setUserScores(userData.scores);
      setUserName(userData.nombre || '');

      // Fetch promedios
      const avgResponse = await fetch('/api/notion-averages');
      const avgData = await avgResponse.json();

      setAverageScores(avgData.averages);
      setTotalResponses(avgData.total);
      setLoading(false);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    console.warn('No submission_id found, showing demo data');

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

    try {
      const response = await fetch('/api/notion-averages');
      const data = await response.json();
      setAverageScores(data.averages);
      setTotalResponses(data.total);
    } catch (err) {
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
    }

    setLoading(false);
  };

  const handleRetry = () => {
    const submission_id = searchParams.get('submission_id');
    if (submission_id) {
      loadDataFromNotion(submission_id);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={handleRetry} />;
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {userName ? `¡Gracias ${userName}!` : '¡Gracias por completar el Quiz!'}
          </h1>
          <p className="text-xl text-gray-600">
            Aquí están tus resultados comparados con {totalResponses} respuestas
          </p>
          {userName && (
            <p className="text-sm text-gray-500 mt-2">
              Datos obtenidos desde Notion ✨
            </p>
          )}
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
            {Object.values(userScores).filter(score => score >= 75).length > 0 ? (
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
            ) : (
              <p className="text-gray-500 italic">
                Aún no has alcanzado el nivel alto en ninguna dimensión
              </p>
            )}
          </div>

          {/* Oportunidades */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📈</div>
              <h3 className="text-2xl font-bold text-gray-800">Oportunidades</h3>
            </div>
            {Object.values(userScores).filter(score => score <= 50).length > 0 ? (
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
            ) : (
              <p className="text-gray-500 italic">
                ¡Excelente! No tienes áreas de oportunidad significativas
              </p>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Qué sigue?</h2>
          <p className="text-lg mb-6 text-purple-100">
            {userName
              ? 'Tus resultados han sido guardados de forma segura en Notion.'
              : 'Basándonos en tus resultados, te recomendamos enfocarte en mejorar las áreas con menor puntuación.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              Imprimir Resultados
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

export default function Resultados() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResultadosContent />
    </Suspense>
  );
}
