import { setRequestLocale } from 'next-intl/server';
import { ACSExtractorPage } from '@/components/acs-extractor/ACSExtractorPage';

export default async function ACSExtractorDashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ACSExtractorPage locale={locale} />;
}
