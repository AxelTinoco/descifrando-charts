
import { useEffect, useRef } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Componente de Gráfica Radial para Quiz de Lealtad
 *
 * Props:
 * - userScores: objeto con los scores del usuario (valores: 25, 50, 75, 100)
 * - showComparison: boolean para mostrar/ocultar comparación con promedio
 * - averageScores: objeto con los promedios (opcional)
 */
export default function RadarScoreChart({
  userScores,
  showComparison = true,
  averageScores = null
}) {

  // Configuración de los scores con sus labels
  const scoreConfig = [
    { key: 'scoreCalidad', label: 'Calidad' },
    { key: 'scoreRelevancia', label: 'Relevancia' },
    { key: 'scoreIdentidad', label: 'Identidad' },
    { key: 'scoreConsistencia', label: 'Consistencia' },
    { key: 'scoreAdopcion', label: 'Adopción' },
    { key: 'scoreValores', label: 'Valores' },
    { key: 'scoreConveniencia', label: 'Conveniencia' },
    { key: 'scoreEficienciaExp', label: 'Eficiencia' },
    { key: 'scoreFamiliaridad', label: 'Familiaridad' },
    { key: 'scoreReconocimiento', label: 'Reconocimiento' },
  ];

  // Transformar datos para el radar chart
  const chartData = scoreConfig.map(({ key, label }) => {
    const dataPoint = {
      subject: label,
      userScore: userScores[key] || 0,
    };

    // Agregar promedio si existe y está habilitado
    if (showComparison && averageScores) {
      dataPoint.average = averageScores[key] || 0;
    }

    return dataPoint;
  });

  // Calcular promedio del usuario
  const userAverage = (
    scoreConfig.reduce((sum, { key }) => sum + (userScores[key] || 0), 0) /
    scoreConfig.length
  ).toFixed(1);

  // Calcular promedio general (si existe)
  const generalAverage = averageScores ? (
    scoreConfig.reduce((sum, { key }) => sum + (averageScores[key] || 0), 0) /
    scoreConfig.length
  ).toFixed(1) : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-purple-200">
          <p className="font-bold text-gray-800 mb-2">{payload[0].payload.subject}</p>
          <p className="text-purple-600 font-semibold">
            Tu score: {payload[0].value}%
          </p>
          {payload.length > 1 && (
            <p className="text-blue-600 font-semibold">
              Promedio: {payload[1].value}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Header con promedios */}

      {/* Gráfica Radial */}
      <div className="bg-[#232323] rounded-xl shadow-lg p-6">
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />

            {/* Radar del usuario */}
            <Radar
              name="Tu Score"
              dataKey="userScore"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              strokeWidth={2}
            />

            {/* Radar del promedio (si existe) */}
            {showComparison && averageScores && (
              <Radar
                name="Promedio General"
                dataKey="average"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Leyenda de valores */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-red-600 font-bold text-lg">25%</div>
            <div className="text-xs text-red-700">Bajo</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-yellow-600 font-bold text-lg">50%</div>
            <div className="text-xs text-yellow-700">Medio</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-green-600 font-bold text-lg">75%</div>
            <div className="text-xs text-green-700">Alto</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-purple-600 font-bold text-lg">100%</div>
            <div className="text-xs text-purple-700">Excelente</div>
          </div>
        </div>
      </div>

    </div>
  );
}
