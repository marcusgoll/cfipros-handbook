import { getTranslations } from 'next-intl/server';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Resources',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function Resources() {
  return (
    <>
      <div className="prose prose-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Aviation Resources</h1>

        <p className="text-lg mb-6">
          Essential aviation resources for certified flight instructors, pilots, and aviation professionals.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Official Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://www.faa.gov/regulations_policies/faa_regulations/" className="text-blue-600 hover:underline">FAA Regulations (CFR)</a></li>
              <li><a href="https://www.faa.gov/regulations_policies/advisory_circulars/" className="text-blue-600 hover:underline">Advisory Circulars</a></li>
              <li><a href="https://www.faa.gov/air_traffic/publications/" className="text-blue-600 hover:underline">ATC Publications</a></li>
              <li><a href="https://www.faa.gov/training_testing/testing/" className="text-blue-600 hover:underline">Knowledge Testing</a></li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Weather Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://www.aviationweather.gov/" className="text-blue-600 hover:underline">Aviation Weather Center</a></li>
              <li><a href="https://www.weather.gov/" className="text-blue-600 hover:underline">National Weather Service</a></li>
              <li><a href="https://www.faa.gov/air_traffic/weather/" className="text-blue-600 hover:underline">FAA Weather Services</a></li>
              <li><a href="https://www.spc.noaa.gov/" className="text-blue-600 hover:underline">Storm Prediction Center</a></li>
            </ul>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Navigation & Charts</h3>
            <ul className="space-y-2">
              <li><a href="https://www.faa.gov/air_traffic/flight_info/aeronav/" className="text-blue-600 hover:underline">Aeronautical Information</a></li>
              <li><a href="https://skyvector.com/" className="text-blue-600 hover:underline">SkyVector</a></li>
              <li><a href="https://www.airnav.com/" className="text-blue-600 hover:underline">AirNav</a></li>
              <li><a href="https://notams.aim.faa.gov/" className="text-blue-600 hover:underline">NOTAM Search</a></li>
            </ul>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Training Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://www.faa.gov/training_testing/" className="text-blue-600 hover:underline">FAA Training</a></li>
              <li><a href="https://www.faasafety.gov/" className="text-blue-600 hover:underline">FAA Safety</a></li>
              <li><a href="https://www.aopa.org/training-and-safety" className="text-blue-600 hover:underline">AOPA Training</a></li>
              <li><a href="https://www.nafi.org/" className="text-blue-600 hover:underline">NAFI Resources</a></li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <div className="grid gap-2 md:grid-cols-3">
            <a href="/handbook" className="text-blue-600 hover:underline">Aviation Handbook</a>
            <a href="/search" className="text-blue-600 hover:underline">Search Knowledge Base</a>
            <a href="/about" className="text-blue-600 hover:underline">About CFIPros</a>
          </div>
        </div>
      </div>
    </>
  );
};
