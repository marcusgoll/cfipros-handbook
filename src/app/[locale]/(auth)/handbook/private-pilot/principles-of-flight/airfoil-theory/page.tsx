import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { LessonLayout } from '@/components/mdx/LessonLayout';

const AirfoilTheoryContent = dynamic(() => import('@/../content/handbook/private-pilot/principles-of-flight/airfoil-theory.mdx'));

export default async function AirfoilTheoryLesson(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const metadata = {
    title: 'Airfoil Theory and Design',
    description: 'How wing shape affects lift generation',
    duration: '25 min',
    category: 'principles-of-flight',
    order: 2,
  };

  const previousLesson = {
    id: 'four-forces',
    title: 'The Four Forces of Flight',
  };

  const nextLesson = {
    id: 'angle-of-attack',
    title: 'Angle of Attack',
  };

  return (
    <LessonLayout
      metadata={metadata}
      locale={locale}
      categoryTitle="Principles of Flight"
      unitId="principles-of-flight"
      lessonId="airfoil-theory"
      previousLesson={previousLesson}
      nextLesson={nextLesson}
    >
      <AirfoilTheoryContent />
    </LessonLayout>
  );
}
