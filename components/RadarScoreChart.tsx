
import { useEffect, useRef } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

interface RadarScoreChartProps {
  userScores: Scores;
  showComparison?: boolean;
  averageScores?: Scores | null;
}

interface ChartDataPoint {
  subject: string;
  userScore: number;
  average?: number;
}

/**
 * Componente de Gráfica Radial para Quiz de Lealtad
 *
 * Props:
 * - userScores: objeto con los scores del usuario (valores: 0, 33, 66, 100)
 * - showComparison: boolean para mostrar/ocultar comparación con promedio
 * - averageScores: objeto con los promedios (opcional)
 */
export default function RadarScoreChart({
  userScores,
  showComparison = true,
  averageScores = null
}: RadarScoreChartProps) {

  // Configuración de los scores con sus labels
  // El orden sigue el sentido horario empezando desde la parte superior
  const scoreConfig: Array<{ key: keyof Scores; label: string }> = [
    { key: 'scoreRelevancia', label: 'Relevancia' },
    { key: 'scoreAdopcion', label: 'Adopción' },
    { key: 'scoreEficienciaExp', label: 'Eficiencia' },
    { key: 'scoreReconocimiento', label: 'Reconocimiento' },
    { key: 'scoreIdentidad', label: 'Identidad' },
    { key: 'scoreValores', label: 'Valores' },
    { key: 'scoreFamiliaridad', label: 'Familiaridad' },
    { key: 'scoreConveniencia', label: 'Conveniencia' },
    { key: 'scoreConsistencia', label: 'Consistencia' },
    { key: 'scoreCalidad', label: 'Calidad' },
  ];

  // Transformar datos para el radar chart
  const chartData = scoreConfig.map(({ key, label }) => {
    const dataPoint: ChartDataPoint = {
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

  // Custom tick para mostrar label + porcentaje
  const CustomTick = ({ x, y, payload, index }: any) => {
    // Buscar el score correspondiente en chartData
    const dataPoint = chartData.find(item => item.subject === payload.value);
    const percentage = dataPoint ? dataPoint.userScore : 0;

    // Calcular el ángulo para posicionar mejor el texto
    const totalPoints = scoreConfig.length;
    const angle = (index * 360) / totalPoints - 90; // -90 para empezar arriba

    // Calcular offset dinámico basado en la posición
    let textAnchor: 'middle' | 'start' | 'end' = 'middle';
    let dx = 0;
    let dy = 0;

    if (index === 0) {
      // Top
      dy = -10;
    } else if (index < totalPoints / 2) {
      // Right side
      textAnchor = 'start';
      dx = 10;
    } else if (index === Math.floor(totalPoints / 2)) {
      // Bottom
      dy = 20;
    } else {
      // Left side
      textAnchor = 'end';
      dx = -10;
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={dx}
          y={dy}
          textAnchor={textAnchor}
          fill="#9ca3af"
          fontSize={14}
          fontWeight={500}
        >
          {payload.value}
        </text>
        <text
          x={dx}
          y={dy + 18}
          textAnchor={textAnchor}
          fill="#c084fc"
          fontSize={12}
          fontWeight={700}
        >
          {percentage}%
        </text>
      </g>
    );
  };


  return (
    <div className="w-full">
      {/* Header con promedios */}

      {/* Gráfica Radial */}
      <div className="bg-[#232323] rounded-xl shadow-lg p-8">
        <ResponsiveContainer width="100%" height={600}>
          <RadarChart data={chartData}>
            {/* Grid más sutil */}
            <PolarGrid
              stroke="#4a5568"
              strokeWidth={1}
              strokeOpacity={0.3}
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={<CustomTick />}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={5}
              tick={false}
              axisLine={false}
            />

            {/* Radar del usuario (adelante) */}
            <Radar
              name="Tu Score"
              dataKey="userScore"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.5}
              strokeWidth={3}
            />

            <Legend
              wrapperStyle={{ paddingTop: '30px' }}
              iconType="circle"
              iconSize={12}
            />
          </RadarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}
