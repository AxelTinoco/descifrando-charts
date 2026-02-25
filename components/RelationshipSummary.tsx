import Image from 'next/image';
import React from 'react';

interface RelationshipSummaryProps {
  brandName?: string;
  relationshipType: string;
  overallScore: number;
  topPillars: Array<{
    name: string;
    score: number;
  }>;
}

export default function RelationshipSummary({
  brandName = 'Ben&Frank',
  relationshipType = 'Transaccional',
  overallScore,
  topPillars,
}: RelationshipSummaryProps) {
  return (
    <div className="bg-white rounded-xl border-4 border-blue-500 p-8 shadow-xl">
      {/* Header con nombre de marca */}
      <Image
        src="/icons/Volaris.png"
        alt="Volaris"
        width={120}
        height={80}
        className="h-16 md:h-20 w-auto"
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Lado izquierdo - Pilares */}
        <div className="flex w-[450px] flex-col">
          <div className="mb-6">
            <span className="text-lg text-gray-700">Tu relación es: </span>
            <span className=" text-lg font-bold text-gray-900">
              {relationshipType}
            </span>
          </div>

          <div className="space-y-2 text-lg text-gray-700">
            <p>
              El primer pilar más relevante es:{' '}
              <span className="font-bold text-gray-900">
                {topPillars[0]?.name || 'N/A'}
              </span>
            </p>
            <p>
              El segundo pilar más relevante es:{' '}
              <span className="font-bold text-gray-900">
                {topPillars[1]?.name || 'N/A'}
              </span>
            </p>
            <p>
              El tercero pilar más relevante es:{' '}
              <span className="font-bold text-gray-900">
                {topPillars[2]?.name || 'N/A'}
              </span>
            </p>
          </div>
        </div>

        {/* Lado derecho - Scores */}
        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center">
          {/* Score principal */}
          <div className="flex flex-col items-center bg-gray-50 rounded-2xl px-8 py-6 border-l-4 border-gray-300">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {relationshipType}
            </div>
            <div className="text-5xl font-bold text-gray-900">
              {overallScore.toFixed(1)}%
            </div>
          </div>

          {/* Top 3 pilares con scores */}
          {topPillars.slice(0, 3).map((pillar, index) => (
            <React.Fragment key={index}>
              {/* Separador */}
              <div className="hidden lg:block w-px h-20 bg-gray-300"></div>

              {/* Pilar score */}
              <div className="flex flex-col items-center">
                <div className="w-auto h-12 rounded-full flex items-center justify-center mb-2">
                  <Image
                    src="/icons/Plus.png"
                    alt="Apple"
                    width={39}
                    height={39}
                    className="h-10 w-auto"
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    {pillar.name}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {pillar.score.toFixed(1)}%
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}
