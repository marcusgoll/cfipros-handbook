import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <>
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          {t('welcome_title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t('welcome_description')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/handbook"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('cta_explore_handbook')}
          </Link>
          <Link
            href="/sign-up"
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {t('cta_get_started')}
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose CFIPros?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-3">Comprehensive Coverage</h3>
            <p className="text-gray-600">
              10,000+ aviation topics covering regulations, procedures, aircraft systems, and more.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-3">Instant Search</h3>
            <p className="text-gray-600">
              Find any aviation topic in milliseconds with our powerful search engine.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-3">Always Current</h3>
            <p className="text-gray-600">
              Stay up-to-date with the latest regulations and procedures from the FAA.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="py-16 bg-gray-50 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Quick Access
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/handbook/regulations"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900">Regulations</h3>
            <p className="text-sm text-gray-600 mt-2">FAR Parts 61, 91, and more</p>
          </Link>
          
          <Link
            href="/handbook/procedures"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div className="text-3xl mb-3">🛫</div>
            <h3 className="font-semibold text-gray-900">Procedures</h3>
            <p className="text-sm text-gray-600 mt-2">Preflight, emergency, and more</p>
          </Link>
          
          <Link
            href="/handbook/reference"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900">Reference</h3>
            <p className="text-sm text-gray-600 mt-2">Weather codes, charts, tables</p>
          </Link>
          
          <Link
            href="/handbook/aircraft-systems"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-gray-900">Systems</h3>
            <p className="text-sm text-gray-600 mt-2">Engine, electrical, and more</p>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to Master Aviation Knowledge?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of aviation professionals who trust CFIPros for their knowledge needs.
        </p>
        <Link
          href="/sign-up"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
        >
          Start Learning Today
        </Link>
      </div>
    </>
  );
};
