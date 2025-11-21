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
  averageScores?: Scores | null | undefined;
}

export default function RadarScoreChart(props: RadarScoreChartProps): JSX.Element;
