import { setRequestLocale } from 'next-intl/server';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { HandbookLayout as HandbookSidebarLayout } from '@/components/handbook/HandbookLayout';

export default async function HandbookLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <DashboardLayout locale={locale}>
      <HandbookSidebarLayout locale={locale}>
        {props.children}
      </HandbookSidebarLayout>
    </DashboardLayout>
  );
}
