import React from 'react';

export default function ScoreLegend() {
  const scoreLevels = [
    {
      percentage: '25%',
      label: 'Bajo',
      percentageColor: '#DC2626',
      labelColor: '#DC2626',
    },
    {
      percentage: '50%',
      label: 'Medio',
      percentageColor: '#D97706',
      labelColor: '#D97706',
    },
    {
      percentage: '75%',
      label: 'Alto',
      percentageColor: '#059669',
      labelColor: '#059669',
    },
    {
      percentage: '100%',
      label: 'Excelente',
      percentageColor: '#7C3AED',
      labelColor: '#7C3AED',
    },
  ];

  return (
    <div className="w-full">
      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-white flex items-center justify-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-purple-600 rounded-full"></span>
          Tu Score
        </h2>
      </div>

    </div>
  );
}
