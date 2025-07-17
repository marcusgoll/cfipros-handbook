import { getTranslations, setRequestLocale } from 'next-intl/server';

type IAboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IAboutProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return (
    <>
      <div className="prose prose-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About CFIPros</h1>
        
        <p className="text-lg mb-4">{t('about_paragraph')}</p>
        
        <p className="text-lg mb-6">{t('our_mission')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">For Flight Instructors</h3>
            <ul className="space-y-2">
              <li>✓ Comprehensive regulation database</li>
              <li>✓ Teaching resources and guides</li>
              <li>✓ Current FAA updates</li>
              <li>✓ Professional development materials</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">For Pilots</h3>
            <ul className="space-y-2">
              <li>✓ Study materials for all certificates</li>
              <li>✓ Quick reference guides</li>
              <li>✓ Weather and navigation tools</li>
              <li>✓ Practical test preparation</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose CFIPros?</h2>
        
        <ul className="space-y-3 mb-8">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">✈️</span>
            <span><strong>Always Current</strong> - Real-time updates to regulations and procedures</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">📚</span>
            <span><strong>Comprehensive Coverage</strong> - 10,000+ aviation topics at your fingertips</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">🔍</span>
            <span><strong>Instant Search</strong> - Find any topic in milliseconds</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">📱</span>
            <span><strong>Mobile Optimized</strong> - Access anywhere, anytime</span>
          </li>
        </ul>

        <div className="bg-gray-100 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-2">{t('contact_us')}</h3>
          <p className="mb-2">Have questions or suggestions? We'd love to hear from you!</p>
          <p>
            Email: <a href="mailto:support@cfipros.com" className="text-blue-600 hover:underline">support@cfipros.com</a>
          </p>
        </div>
      </div>
    </>
  );
};
