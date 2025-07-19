import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { LessonLayout } from '@/components/mdx/LessonLayout';

const AngleOfAttackContent = dynamic(() => import('@/../content/handbook/private-pilot/principles-of-flight/angle-of-attack.mdx'));

export default async function AngleOfAttackLesson(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const metadata = {
    title: 'Angle of Attack',
    description: 'Relationship between AOA and lift coefficient',
    duration: '15 min',
    category: 'principles-of-flight',
    order: 3,
  };

  const previousLesson = {
    id: 'airfoil-theory',
    title: 'Airfoil Theory and Design',
  };

  const nextLesson = {
    id: 'stall-characteristics',
    title: 'Stall Characteristics',
  };

  return (
    <LessonLayout
      metadata={metadata}
      locale={locale}
      categoryTitle="Principles of Flight"
      unitId="principles-of-flight"
      lessonId="angle-of-attack"
      previousLesson={previousLesson}
      nextLesson={nextLesson}
    >
      <AngleOfAttackContent />
    </LessonLayout>
  );
}