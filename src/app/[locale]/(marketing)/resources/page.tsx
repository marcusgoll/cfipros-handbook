import { setRequestLocale } from 'next-intl/server';
import { FullWidthLayout } from '@/components/layouts/FullWidthLayout';
import { ResourceLibraryPage } from '@/components/resources/ResourceLibraryPage';

// Force dynamic rendering since this page makes client-side API calls
export const dynamic = 'force-dynamic';

export default async function ResourcesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <FullWidthLayout
      locale={locale}
      maxWidth="7xl"
      padding="lg"
    >
      <ResourceLibraryPage locale={locale} />
    </FullWidthLayout>
  );
}
