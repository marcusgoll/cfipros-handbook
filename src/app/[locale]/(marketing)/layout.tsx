import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {props.children}
      </main>
    </div>
  );
}
