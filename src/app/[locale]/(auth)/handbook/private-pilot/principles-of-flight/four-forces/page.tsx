import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { LessonLayout } from '@/components/mdx/LessonLayout';

// Dynamically import the MDX content
const FourForcesContent = dynamic(() => import('@/../content/handbook/private-pilot/principles-of-flight/four-forces.mdx'));

export default async function FourForcesLesson(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const metadata = {
    title: 'The Four Forces of Flight',
    description: 'Understanding lift, weight, thrust, and drag',
    duration: '20 min',
    category: 'principles-of-flight',
    order: 1,
  };

  const nextLesson = {
    id: 'airfoil-theory',
    title: 'Airfoil Theory and Design',
  };

  return (
    <LessonLayout
      metadata={metadata}
      locale={locale}
      categoryTitle="Principles of Flight"
      unitId="principles-of-flight"
      lessonId="four-forces"
      nextLesson={nextLesson}
    >
      <FourForcesContent />
    </LessonLayout>
  );
}
