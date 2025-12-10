'use client';

import DimensionCard from '@/components/DimensionCard';

export default function DimensionesPage() {
  const dimensions = [
    {
      id: 1,
      icon: '/icons/Calidad.png', // You'll need to add your SVG icons here
      backgroundColor: '#B8E6E6',
      title: 'Calidad y eficacia',
      description:
        'Capacidad de la marca para ofrecer productos o servicios que cumplan consistentemente con lo prometido, garantizando funcionalidad y satisfacción en la relación costo-beneficio.',
      label: 'Calidad y eficacia',
    },
    {
      id: 2,
      icon: '/icons/Consistencia.png',
      backgroundColor: '#B8E6E6',
      title: 'Consistencia',
      description:
        'Cumplimiento constante de la promesa de valor de la marca a lo largo del tiempo, reforzando la confianza del usuario.',
      label: 'Consistencia',
    },
    {
      id: 3,
      icon: '/icons/Conveniencia.png',
      backgroundColor: '#B8E6E6',
      title: 'Conveniencia',
      description:
        'Facilidad de acceso, disponibilidad y simplicidad en los procesos que permiten al usuario mantener un vínculo fluido con la marca.',
      label: 'Conveniencia',
    },
    {
      id: 4,
      icon: '/icons/Relevancia.png',
      backgroundColor: '#67CDD5',
      title: 'Relevancia',
      description:
        'Capacidad de la marca para mantenerse significativa en la vida de las personas, adaptándose a sus necesidades cambiantes y al contexto social y cultural.',
      label: 'Relevancia',
    },
    {
      id: 5,
      icon: '/icons/Adopcion.png',
      backgroundColor: '#67CDD5',
      title: 'Adopción',
      description:
        'Nivel de integración de los productos o servicios de la marca en la rutina diaria de las personas, convirtiéndose en parte de sus hábitos y estilo de vida.',
      label: 'Adopción',
    },
    {
      id: 6,
      icon: '/icons/Eficiencia.png',
      backgroundColor: '#67CDD5',
      title: 'Eficiencia en la experiencia',
      description:
        'Calidad y diferenciación del servicio o experiencia en cada punto de contacto, combinando lo funcional y lo emocional para generar interacciones memorables.',
      label: 'Eficiencia en la experiencia',
    },
    {
      id: 7,
      icon: '/icons/Reconocimiento.png',
      backgroundColor: '#67CDD5',
      title: 'Reconocimiento',
      description:
        'Valoración tangible o simbólica hacia los usuarios frecuentes, expresada mediante beneficios, recompensas o gestos que los hacen sentirse apreciados y valorados.',
      label: 'Reconocimiento',
    },
    {
      id: 8,
      icon: '/icons/Identidad.png',
      backgroundColor: '#3D7B80',
      title: 'Identidad',
      description:
        'El grado en que una marca refleja el estilo de vida, aspiraciones o valores personales de los consumidores, funcionando como un espejo de quiénes son o aspiran a ser.',
      label: 'Identidad',
    },
    {
      id: 9,
      icon: '/icons/Valores.png',
      backgroundColor: '#3D7B80',
      title: 'Valores e impacto',
      description:
        'Alineación de la marca con principios éticos, sociales y ambientales significativos para los consumidores, generando confianza y legitimidad.',
      label: 'Valores e impacto',
    },
    {
      id: 10,
      icon: '/icons/Familiaridad.png',
      backgroundColor: '#3D7B80',
      title: 'Familiaridad',
      description:
        'Vínculo emocional que surge de la cercanía y continuidad en el tiempo, generando confianza y seguridad.',
      label: 'Familiaridad',
    },
  ];

  return (
    <div className="min-h-screen bg-[#232323] p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">
          Dimensiones de Lealtad
        </h1>

        {dimensions.map((dimension) => (
          <DimensionCard
            key={dimension.id}
            icon={dimension.icon}
            backgroundColor={dimension.backgroundColor}
            title={dimension.title}
            description={dimension.description}
            label={dimension.label}
          />
        ))}
      </div>
    </div>
  );
}
