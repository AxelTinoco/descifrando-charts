'use client'
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import RadarScoreChart from '@/components/RadarScoreChart';
import DimensionCard from '@/components/DimensionCard';
import RelationshipSummary from '@/components/RelationshipSummary';

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

// Función para calcular el score general (promedio de todos los pilares)
function calculateOverallScore(scores: Scores): number {
  const values = Object.values(scores);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// Función para obtener los top 3 pilares
function getTopPillars(scores: Scores): Array<{ name: string; score: number }> {
  const pillars = Object.entries(scores).map(([key, value]) => ({
    name: scoreLabels[key as ScoreKey],
    score: value,
  }));

  return pillars.sort((a, b) => b.score - a.score).slice(0, 3);
}

// Agrupación de pilares por tipo de relación
const relationshipGroups = {
  transaccional: ['scoreCalidad', 'scoreConsistencia', 'scoreConveniencia'] as ScoreKey[],
  mixta: ['scoreRelevancia', 'scoreAdopcion', 'scoreEficienciaExp', 'scoreReconocimiento'] as ScoreKey[],
  emocional: ['scoreIdentidad', 'scoreValores', 'scoreFamiliaridad'] as ScoreKey[],
};

interface RelationshipResult {
  type: 'Transaccional' | 'Mixta' | 'Emocional';
  transaccionalAvg: number;
  mixtaAvg: number;
  emocionalAvg: number;
}

// Función para determinar el tipo de relación basado en promedios por grupo
function getRelationshipType(scores: Scores): RelationshipResult {
  const avg = (keys: ScoreKey[]) =>
    keys.reduce((sum, k) => sum + scores[k], 0) / keys.length;

  const transaccionalAvg = avg(relationshipGroups.transaccional);
  const mixtaAvg = avg(relationshipGroups.mixta);
  const emocionalAvg = avg(relationshipGroups.emocional);

  let type: RelationshipResult['type'];
  if (transaccionalAvg >= mixtaAvg && transaccionalAvg >= emocionalAvg) {
    type = 'Transaccional';
  } else if (emocionalAvg >= mixtaAvg) {
    type = 'Emocional';
  } else {
    type = 'Mixta';
  }

  return { type, transaccionalAvg, mixtaAvg, emocionalAvg };
}

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
    <div className="min-h-screen flex items-center justify-center bg-[#232323]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-200 text-lg">Cargando tus resultados...</p>
        <p className="mt-2 text-gray-400 text-sm">Esto puede tomar unos segundos</p>
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

function RelationshipTypes({ relationship }: { relationship: RelationshipResult }) {
  const activeSegment = relationship.type.toLowerCase() as 'transaccional' | 'mixta' | 'emocional';

  const segments = [
    {
      key: 'transaccional' as const,
      icon: '/relaciones/transaccional.svg',
      title: 'RELACIÓN\nTRANSACCIONAL',
      description: 'Una relación basada en beneficios funcionales',
      avg: relationship.transaccionalAvg,
    },
    {
      key: 'mixta' as const,
      icon: '/relaciones/mixta.svg',
      title: 'RELACIÓN\nMIXTA',
      description: 'Una relación basada en beneficios funcionales y emocionales',
      avg: relationship.mixtaAvg,
    },
    {
      key: 'emocional' as const,
      icon: '/relaciones/emocional.svg',
      title: 'RELACIÓN\nEMOCIONAL',
      description: 'Una relación basada en beneficios emocionales',
      avg: relationship.emocionalAvg,
    },
  ];

  // Bar position: map the winning group to a position on the gradient
  // Transaccional = left (avg mapped to 0-33%), Mixta = center (33-66%), Emocional = right (66-100%)
  const maxAvg = Math.max(relationship.transaccionalAvg, relationship.mixtaAvg, relationship.emocionalAvg);
  let barPercent: number;
  if (activeSegment === 'transaccional') {
    barPercent = (relationship.transaccionalAvg / maxAvg) * 33;
  } else if (activeSegment === 'mixta') {
    barPercent = 33 + (relationship.mixtaAvg / maxAvg) * 33;
  } else {
    barPercent = 66 + (relationship.emocionalAvg / maxAvg) * 34;
  }

  return (
    <div className="mt-12">
      {/* Three columns */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        {segments.map((seg) => (
          <div key={seg.key} className="flex flex-col items-center text-center">
            <Image
              src={seg.icon}
              alt={seg.key}
              width={46}
              height={33}
              className="mb-3"
            />
            <h3
              className={`text-lg font-bold uppercase whitespace-pre-line leading-tight mb-2 ${
                activeSegment === seg.key ? 'text-white' : 'text-gray-400'
              }`}
            >
              {seg.title}
            </h3>
            <p
              className={`text-sm ${
                activeSegment === seg.key ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {seg.description}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-gray-700 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${barPercent}%`,
            background: 'linear-gradient(to right, #1a4a4e, #3d7b80, #67cdd5, #a0e8ef)',
          }}
        />
        {/* Divider lines at 33% and 66% */}
        <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-900" />
        <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gray-900" />
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
    const scoresParam = searchParams.get('scores');
    const nombreParam = searchParams.get('nombre');

    // Prioridad 1: Datos directos desde el webhook (parámetros URL) - Legacy
    if (scoresParam) {
      console.log('📊 Cargando datos desde parámetros URL (modo legacy)');
      try {
        const parsedScores = JSON.parse(scoresParam);
        setUserScores(parsedScores);
        setUserName(nombreParam || 'Usuario');

        // Cargar promedios en background
        loadAverages();
        setLoading(false);
      } catch (err) {
        console.error('Error parsing scores from URL:', err);
        // Fallback a caché
        if (submission_id) {
          loadDataFromCache(submission_id);
        } else {
          loadDemoData();
        }
      }
    }
    // Prioridad 2: Buscar en caché (modo principal)
    else if (submission_id) {
      console.log('📊 Cargando datos desde caché');
      loadDataFromCache(submission_id);
    }
    // Prioridad 3: Modo demo
    else {
      console.log('📊 Cargando datos demo');
      loadDemoData();
    }
  }, [searchParams]);

  const loadDataFromCache = async (submissionId: string, retryCount = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/get-results?submission_id=${submissionId}`);
      const data = await response.json();

      if (!data.success || !data.scores) {
        // Si no encuentra los datos y es el primer intento, reintentar después de 2 segundos
        if (retryCount < 3) {
          console.log(`⏳ Reintentando en 2 segundos... (intento ${retryCount + 1}/3)`);
          setTimeout(() => {
            loadDataFromCache(submissionId, retryCount + 1);
          }, 2000);
          return;
        }

        // Si después de 3 intentos no encuentra en caché, consultar Notion directamente
        console.log('💾 Caché vacío (probablemente en Vercel serverless), consultando Notion...');
        await loadDataFromNotion(submissionId);
        return;
      }

      setUserScores(data.scores);
      setUserName(data.nombre || 'Usuario');

      // Cargar promedios
      await loadAverages();
      setLoading(false);

    } catch (err) {
      console.error('Error loading data from cache:', err);

      // Reintentar si es el primer intento
      if (retryCount < 3) {
        console.log(`⏳ Reintentando en 2 segundos... (intento ${retryCount + 1}/3)`);
        setTimeout(() => {
          loadDataFromCache(submissionId, retryCount + 1);
        }, 2000);
        return;
      }

      // Después de 3 intentos fallidos, intentar Notion como último recurso
      console.log('💾 Error persistente en caché, consultando Notion como fallback...');
      try {
        await loadDataFromNotion(submissionId);
      } catch (notionErr) {
        console.error('Error loading from Notion:', notionErr);
        setError('Error al cargar los datos desde todas las fuentes');
        setLoading(false);
      }
    }
  };

  const loadAverages = async () => {
    try {
      const response = await fetch('/api/notion-averages');
      const data = await response.json();

      if (data.success) {
        setAverageScores(data.averages);
        setTotalResponses(data.total);
      } else {
        // Fallback: valores promedio realistas
        setAverageScores({
          scoreCalidad: 65,
          scoreRelevancia: 58,
          scoreIdentidad: 62,
          scoreConsistencia: 70,
          scoreAdopcion: 55,
          scoreValores: 68,
          scoreConveniencia: 60,
          scoreEficienciaExp: 64,
          scoreFamiliaridad: 72,
          scoreReconocimiento: 67,
        });
        setTotalResponses(100);
      }
    } catch (err) {
      console.error('Error loading averages:', err);
      // Fallback values
      setAverageScores({
        scoreCalidad: 65,
        scoreRelevancia: 58,
        scoreIdentidad: 62,
        scoreConsistencia: 70,
        scoreAdopcion: 55,
        scoreValores: 68,
        scoreConveniencia: 60,
        scoreEficienciaExp: 64,
        scoreFamiliaridad: 72,
        scoreReconocimiento: 67,
      });
      setTotalResponses(100);
    }
  };

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

    // Valores demo actualizados a la nueva escala (0, 33, 66, 100)
    setUserScores({
      scoreCalidad: 66,
      scoreRelevancia: 33,
      scoreIdentidad: 66,
      scoreConsistencia: 100,
      scoreAdopcion: 33,
      scoreValores: 66,
      scoreConveniencia: 66,
      scoreEficienciaExp: 66,
      scoreFamiliaridad: 100,
      scoreReconocimiento: 66,
    });

    try {
      const response = await fetch('/api/notion-averages');
      const data = await response.json();
      setAverageScores(data.averages);
      setTotalResponses(data.total);
    } catch (err) {
      // Fallback: valores promedio realistas con la nueva escala
      setAverageScores({
        scoreCalidad: 65,
        scoreRelevancia: 58,
        scoreIdentidad: 62,
        scoreConsistencia: 70,
        scoreAdopcion: 55,
        scoreValores: 68,
        scoreConveniencia: 60,
        scoreEficienciaExp: 64,
        scoreFamiliaridad: 72,
        scoreReconocimiento: 67,
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
    <div className="min-h-screen bg-[#232323] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-white mb-6">
            Tu relación con
          </h1>
          <Image
            src="/icons/apple.png"
            alt="Apple"
            width={120}
            height={80}
            className="h-16 md:h-20 w-auto"
          />
        </div>

        {/* Gráfica Principal */}
        <RadarScoreChart
          userScores={userScores}
          averageScores={averageScores}
          showComparison={true}
        />

        {/* Resumen de Relación */}
        {(() => {
          const relationship = getRelationshipType(userScores);
          return (
            <>
              <div className="mt-12">
                <RelationshipSummary
                  brandName="Marca"
                  relationshipType={relationship.type}
                  overallScore={calculateOverallScore(userScores)}
                  topPillars={getTopPillars(userScores)}
                />
              </div>

              {/* Tipos de Relación */}
              <RelationshipTypes relationship={relationship} />
            </>
          );
        })()}

        {/* Dimensiones de Lealtad */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Columna 1 - 3 tarjetas */}
          <div className="space-y-4">
            <DimensionCard
              icon="/icons/Calidad.png"
              backgroundColor="#B8E6E6"
              title="Calidad y eficacia"
              description="Capacidad de la marca para ofrecer productos o servicios que cumplan consistentemente con lo prometido, garantizando funcionalidad y satisfacción en la relación costo-beneficio."
              label="Calidad y eficacia"
            />
            <DimensionCard
              icon="/icons/Consistencia.png"
              backgroundColor="#B8E6E6"
              title="Consistencia"
              description="Cumplimiento constante de la promesa de valor de la marca a lo largo del tiempo, reforzando la confianza del usuario."
              label="Consistencia"
            />
            <DimensionCard
              icon="/icons/Conveniencia.png"
              backgroundColor="#B8E6E6"
              title="Conveniencia"
              description="Facilidad de acceso, disponibilidad y simplicidad en los procesos que permiten al usuario mantener un vínculo fluido con la marca."
              label="Conveniencia"
            />
          </div>

          {/* Columna 2 - 4 tarjetas */}
          <div className="space-y-4">
            <DimensionCard
              icon="/icons/Relevancia.png"
              backgroundColor="#67CDD5"
              title="Relevancia"
              description="Capacidad de la marca para mantenerse significativa en la vida de las personas, adaptándose a sus necesidades cambiantes y al contexto social y cultural."
              label="Relevancia"
            />
            <DimensionCard
              icon="/icons/Adopcion.png"
              backgroundColor="#67CDD5"
              title="Adopción"
              description="Nivel de integración de los productos o servicios de la marca en la rutina diaria de las personas, convirtiéndose en parte de sus hábitos y estilo de vida."
              label="Adopción"
            />
            <DimensionCard
              icon="/icons/Eficiencia.png"
              backgroundColor="#67CDD5"
              title="Eficiencia en la experiencia"
              description="Calidad y diferenciación del servicio o experiencia en cada punto de contacto, combinando lo funcional y lo emocional para generar interacciones memorables."
              label="Eficiencia en la experiencia"
            />
            <DimensionCard
              icon="/icons/Reconocimiento.png"
              backgroundColor="#67CDD5"
              title="Reconocimiento"
              description="Valoración tangible o simbólica hacia los usuarios frecuentes, expresada mediante beneficios, recompensas o gestos que los hacen sentirse apreciados y valorados."
              label="Reconocimiento"
            />
          </div>

          {/* Columna 3 - 3 tarjetas */}
          <div className="space-y-4">
            <DimensionCard
              icon="/icons/Identidad.png"
              backgroundColor="#3D7B80"
              title="Identidad"
              description="El grado en que una marca refleja el estilo de vida, aspiraciones o valores personales de los consumidores, funcionando como un espejo de quiénes son o aspiran a ser."
              label="Identidad"
            />
            <DimensionCard
              icon="/icons/Valores.png"
              backgroundColor="#3D7B80"
              title="Valores e impacto"
              description="Alineación de la marca con principios éticos, sociales y ambientales significativos para los consumidores, generando confianza y legitimidad."
              label="Valores e impacto"
            />
            <DimensionCard
              icon="/icons/Familiaridad.png"
              backgroundColor="#3D7B80"
              title="Familiaridad"
              description="Vínculo emocional que surge de la cercanía y continuidad en el tiempo, generando confianza y seguridad."
              label="Familiaridad"
            />
          </div>
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
