import React from 'react';
import Image from 'next/image';

interface DimensionCardProps {
  icon: string | React.ReactNode;
  backgroundColor?: string;
  title: string;
  description: string;
  label?: string;
  iconClassName?: string;
}

export default function DimensionCard({
  icon,
  backgroundColor = '#B8E6E6',
  title,
  description,
  label,
  iconClassName = '',
}: DimensionCardProps) {
  return (
    <div
      className="relative rounded-lg p-6 shadow-md h-auto min-h-[200px]"
      style={{ backgroundColor }}
    >
      <div className="flex items-center gap-4 pb-6">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconClassName}`}>
          {typeof icon === 'string' ? (
            <Image
              src={icon}
              alt={title}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            icon
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-2 text-base font-bold text-gray-900">{title}</h3>
          <p className="text-sm leading-4 text-gray-700">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
