import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <DashboardLayout locale={locale}>
      {props.children}
    </DashboardLayout>
  );
}
