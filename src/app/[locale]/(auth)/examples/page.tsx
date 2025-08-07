import Link from 'next/link';
import { FullWidthLayout } from '@/components/layouts/FullWidthLayout';

const ExamplesIndex = () => (
  <div>
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Layout Examples</h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Explore our three main layout patterns: Holy Grail, Left Sidebar, and Full Width.
        Each layout is designed for different use cases and content types.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
      {/* Holy Grail Layout */}
      <div className="group">
        <Link href="examples/holy-grail">
          <div className="p-6 border border-border rounded-lg hover:shadow-lg transition-all duration-300 group-hover:border-chart-1">
            <div className="w-full h-32 bg-muted rounded-lg mb-4 flex items-center justify-center">
              <div className="w-full h-full relative bg-gradient-to-r from-chart-1/20 to-chart-1/5 rounded-lg">
                {/* Layout Preview */}
                <div className="absolute top-2 left-2 right-2 h-3 bg-chart-1/30 rounded"></div>
                <div className="absolute top-7 left-2 right-2 h-2 bg-chart-1/20 rounded"></div>
                <div className="absolute top-11 bottom-2 left-2 w-8 bg-chart-1/30 rounded"></div>
                <div className="absolute top-11 bottom-2 left-12 right-12 bg-chart-1/20 rounded"></div>
                <div className="absolute top-11 bottom-2 right-2 w-8 bg-chart-1/30 rounded"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-chart-1 transition-colors">
              Holy Grail Layout
            </h3>
            <p className="text-muted-foreground mb-4">
              Classic three-column layout with header, footer, left sidebar, main content, and right sidebar.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-chart-1/10 text-chart-1 rounded">Documentation</span>
              <span className="px-2 py-1 text-xs bg-chart-1/10 text-chart-1 rounded">CMS</span>
              <span className="px-2 py-1 text-xs bg-chart-1/10 text-chart-1 rounded">Complex UI</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Left Sidebar Layout */}
      <div className="group">
        <Link href="examples/left-sidebar">
          <div className="p-6 border border-border rounded-lg hover:shadow-lg transition-all duration-300 group-hover:border-chart-2">
            <div className="w-full h-32 bg-muted rounded-lg mb-4 flex items-center justify-center">
              <div className="w-full h-full relative bg-gradient-to-r from-chart-2/20 to-chart-2/5 rounded-lg">
                {/* Layout Preview */}
                <div className="absolute top-2 left-2 right-2 h-3 bg-chart-2/30 rounded"></div>
                <div className="absolute top-7 left-2 right-2 h-2 bg-chart-2/20 rounded"></div>
                <div className="absolute top-11 bottom-2 left-2 w-10 bg-chart-2/30 rounded"></div>
                <div className="absolute top-11 bottom-2 left-14 right-2 bg-chart-2/20 rounded"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-chart-2 transition-colors">
              Left Sidebar Layout
            </h3>
            <p className="text-muted-foreground mb-4">
              Perfect for applications with hierarchical navigation and content organization.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-chart-2/10 text-chart-2 rounded">E-Learning</span>
              <span className="px-2 py-1 text-xs bg-chart-2/10 text-chart-2 rounded">Admin</span>
              <span className="px-2 py-1 text-xs bg-chart-2/10 text-chart-2 rounded">Navigation</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Full Width Layout */}
      <div className="group">
        <Link href="examples/full-width">
          <div className="p-6 border border-border rounded-lg hover:shadow-lg transition-all duration-300 group-hover:border-chart-3">
            <div className="w-full h-32 bg-muted rounded-lg mb-4 flex items-center justify-center">
              <div className="w-full h-full relative bg-gradient-to-r from-chart-3/20 to-chart-3/5 rounded-lg">
                {/* Layout Preview */}
                <div className="absolute top-2 left-2 right-2 h-3 bg-chart-3/30 rounded"></div>
                <div className="absolute top-7 left-2 right-2 h-2 bg-chart-3/20 rounded"></div>
                <div className="absolute top-11 bottom-2 left-2 right-2 bg-chart-3/20 rounded"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-chart-3 transition-colors">
              Full Width Layout
            </h3>
            <p className="text-muted-foreground mb-4">
              Maximizes screen real estate for dashboards, data tables, and immersive content.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-chart-3/10 text-chart-3 rounded">Dashboards</span>
              <span className="px-2 py-1 text-xs bg-chart-3/10 text-chart-3 rounded">Data Tables</span>
              <span className="px-2 py-1 text-xs bg-chart-3/10 text-chart-3 rounded">Landing</span>
            </div>
          </div>
        </Link>
      </div>
    </div>

    {/* Feature Comparison */}
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Layout Comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg">
          <thead className="bg-muted">
            <tr>
              <th className="text-left py-4 px-6 text-foreground font-semibold">Feature</th>
              <th className="text-center py-4 px-6 text-chart-1 font-semibold">Holy Grail</th>
              <th className="text-center py-4 px-6 text-chart-2 font-semibold">Left Sidebar</th>
              <th className="text-center py-4 px-6 text-chart-3 font-semibold">Full Width</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="py-4 px-6 font-medium text-foreground">Header & Footer</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">✅</td>
            </tr>
            <tr className="border-t border-border bg-muted/50">
              <td className="py-4 px-6 font-medium text-foreground">Left Sidebar</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">❌</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-4 px-6 font-medium text-foreground">Right Sidebar</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">❌</td>
              <td className="py-4 px-6 text-center">❌</td>
            </tr>
            <tr className="border-t border-border bg-muted/50">
              <td className="py-4 px-6 font-medium text-foreground">Max Width Control</td>
              <td className="py-4 px-6 text-center">❌</td>
              <td className="py-4 px-6 text-center">❌</td>
              <td className="py-4 px-6 text-center">✅</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-4 px-6 font-medium text-foreground">Responsive</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">✅</td>
              <td className="py-4 px-6 text-center">✅</td>
            </tr>
            <tr className="border-t border-border bg-muted/50">
              <td className="py-4 px-6 font-medium text-foreground">Best For</td>
              <td className="py-4 px-6 text-center text-muted-foreground">Complex UIs</td>
              <td className="py-4 px-6 text-center text-muted-foreground">Navigation Heavy</td>
              <td className="py-4 px-6 text-center text-muted-foreground">Content First</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    {/* Getting Started */}
    <section className="text-center">
      <div className="p-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Getting Started</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Each layout component is designed to be flexible and easy to integrate into your existing application.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="examples/holy-grail"
            className="px-6 py-3 bg-chart-1 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Holy Grail
          </Link>
          <Link
            href="examples/left-sidebar"
            className="px-6 py-3 bg-chart-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Left Sidebar
          </Link>
          <Link
            href="examples/full-width"
            className="px-6 py-3 bg-chart-3 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Full Width
          </Link>
        </div>
      </div>
    </section>
  </div>
);

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ExamplesPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <FullWidthLayout
      locale={locale}
      maxWidth="7xl"
      padding="lg"
    >
      <ExamplesIndex />
    </FullWidthLayout>
  );
}
