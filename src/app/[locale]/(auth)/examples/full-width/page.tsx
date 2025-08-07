import { FullWidthLayout } from '@/components/layouts/FullWidthLayout';

// Main Content
const MainContent = () => (
  <div>
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Full Width Layout</h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        The full width layout maximizes screen real estate for content that benefits from
        horizontal space like dashboards, data tables, and visual presentations.
      </p>
    </div>

    {/* Hero Section */}
    <section className="mb-16 p-8 bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-lg">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">Maximize Your Content</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Full width layouts are perfect for showcasing large amounts of data,
          creating immersive experiences, or building landing pages.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-6 py-3 bg-chart-1 text-white rounded-lg">
            Dashboard Views
          </div>
          <div className="px-6 py-3 bg-chart-2 text-white rounded-lg">
            Data Tables
          </div>
          <div className="px-6 py-3 bg-chart-3 text-white rounded-lg">
            Landing Pages
          </div>
        </div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Layout Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-chart-1 rounded-lg mb-4 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Flexible Width</h3>
          <p className="text-muted-foreground">
            Configure maximum width constraints from full width to centered containers.
          </p>
        </div>

        <div className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-chart-2 rounded-lg mb-4 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Responsive Design</h3>
          <p className="text-muted-foreground">
            Automatically adapts to different screen sizes with mobile-first approach.
          </p>
        </div>

        <div className="p-6 border border-border rounded-lg hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-chart-3 rounded-lg mb-4 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Custom Padding</h3>
          <p className="text-muted-foreground">
            Adjustable padding options from none to large for perfect content spacing.
          </p>
        </div>
      </div>
    </section>

    {/* Data Visualization Example */}
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Perfect for Data Display</h2>
      <div className="bg-muted p-6 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-foreground">Metric</th>
                <th className="text-left py-3 px-4 text-foreground">January</th>
                <th className="text-left py-3 px-4 text-foreground">February</th>
                <th className="text-left py-3 px-4 text-foreground">March</th>
                <th className="text-left py-3 px-4 text-foreground">April</th>
                <th className="text-left py-3 px-4 text-foreground">May</th>
                <th className="text-left py-3 px-4 text-foreground">June</th>
                <th className="text-left py-3 px-4 text-foreground">Total</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-3 px-4 font-medium">Users</td>
                <td className="py-3 px-4">1,234</td>
                <td className="py-3 px-4">1,456</td>
                <td className="py-3 px-4">1,789</td>
                <td className="py-3 px-4">2,012</td>
                <td className="py-3 px-4">2,345</td>
                <td className="py-3 px-4">2,678</td>
                <td className="py-3 px-4 font-semibold text-chart-1">11,514</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 font-medium">Sessions</td>
                <td className="py-3 px-4">3,456</td>
                <td className="py-3 px-4">3,789</td>
                <td className="py-3 px-4">4,123</td>
                <td className="py-3 px-4">4,567</td>
                <td className="py-3 px-4">4,891</td>
                <td className="py-3 px-4">5,234</td>
                <td className="py-3 px-4 font-semibold text-chart-2">26,060</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Revenue</td>
                <td className="py-3 px-4">$12,345</td>
                <td className="py-3 px-4">$14,567</td>
                <td className="py-3 px-4">$16,789</td>
                <td className="py-3 px-4">$18,901</td>
                <td className="py-3 px-4">$21,234</td>
                <td className="py-3 px-4">$23,456</td>
                <td className="py-3 px-4 font-semibold text-chart-3">$107,292</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* Implementation Example */}
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Implementation Options</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Basic Usage</h3>
          <pre className="text-sm text-foreground overflow-x-auto">
            {`<FullWidthLayout locale="en">
  <YourContent />
</FullWidthLayout>`}
          </pre>
        </div>

        <div className="p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-foreground">With Constraints</h3>
          <pre className="text-sm text-foreground overflow-x-auto">
            {`<FullWidthLayout 
  locale="en"
  maxWidth="7xl"
  padding="lg"
>
  <YourContent />
</FullWidthLayout>`}
          </pre>
        </div>
      </div>
    </section>

    {/* Call to Action */}
    <section className="text-center">
      <div className="p-8 bg-gradient-to-r from-chart-4/10 to-chart-5/10 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to Build?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Start using the full width layout for your next project and make the most of your screen space.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-chart-4 text-white rounded-lg hover:opacity-90 transition-opacity">
            View Documentation
          </button>
          <button className="px-6 py-3 border border-chart-5 text-chart-5 rounded-lg hover:bg-chart-5 hover:text-white transition-colors">
            See More Examples
          </button>
        </div>
      </div>
    </section>
  </div>
);

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FullWidthExamplePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <FullWidthLayout
      locale={locale}
      maxWidth="7xl"
      padding="lg"
    >
      <MainContent />
    </FullWidthLayout>
  );
}
