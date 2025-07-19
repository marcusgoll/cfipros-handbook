import { setRequestLocale } from 'next-intl/server';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default async function HandbookLayout(props: {
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
