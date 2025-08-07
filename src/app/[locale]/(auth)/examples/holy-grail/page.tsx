import { HolyGrailLayout } from '@/components/layouts/HolyGrailLayout';

// Example Left Sidebar Content
const LeftSidebar = () => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-foreground">Navigation</h3>
    <nav className="space-y-2">
      <button type="button" className="w-full text-left block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Section 1
      </button>
      <button type="button" className="w-full text-left block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Section 2
      </button>
      <button type="button" className="w-full text-left block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Section 3
      </button>
    </nav>

    <div className="mt-8">
      <h4 className="text-sm font-medium mb-3 text-foreground">Quick Links</h4>
      <div className="space-y-1">
        <button type="button" className="w-full text-left block text-xs text-muted-foreground hover:text-foreground">
          Resources
        </button>
        <button type="button" className="w-full text-left block text-xs text-muted-foreground hover:text-foreground">
          Documentation
        </button>
        <button type="button" className="w-full text-left block text-xs text-muted-foreground hover:text-foreground">
          Support
        </button>
      </div>
    </div>
  </div>
);

// Example Right Sidebar Content
const RightSidebar = () => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-foreground">Table of Contents</h3>
    <nav className="space-y-2">
      <a href="#intro" className="block text-sm text-muted-foreground hover:text-foreground">
        Introduction
      </a>
      <a href="#overview" className="block text-sm text-muted-foreground hover:text-foreground">
        Overview
      </a>
      <a href="#details" className="block text-sm text-muted-foreground hover:text-foreground">
        Details
      </a>
      <a href="#conclusion" className="block text-sm text-muted-foreground hover:text-foreground">
        Conclusion
      </a>
    </nav>

    <div className="mt-8 p-4 bg-accent rounded-lg">
      <h4 className="text-sm font-medium mb-2 text-foreground">Pro Tip</h4>
      <p className="text-xs text-muted-foreground">
        Use the Holy Grail layout when you need both navigation and supplementary content.
      </p>
    </div>
  </div>
);

// Main Content
const MainContent = () => (
  <div className="prose prose-sm max-w-none">
    <h1 className="text-3xl font-bold mb-6 text-foreground">Holy Grail Layout</h1>

    <section id="intro" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Introduction</h2>
      <p className="text-muted-foreground mb-4">
        The Holy Grail layout is a classic web design pattern that provides a header, footer,
        and three columns: left sidebar, main content, and right sidebar. This layout is
        particularly useful for content-heavy applications where you need navigation,
        main content, and supplementary information.
      </p>
    </section>

    <section id="overview" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Layout Overview</h2>
      <p className="text-muted-foreground mb-4">
        This layout consists of:
      </p>
      <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
        <li>Header with main navigation</li>
        <li>Sub-navigation for context-specific links</li>
        <li>Left sidebar for primary navigation</li>
        <li>Main content area</li>
        <li>Right sidebar for table of contents or supplementary info</li>
        <li>Footer with additional links</li>
      </ul>
    </section>

    <section id="details" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Implementation Details</h2>
      <p className="text-muted-foreground mb-4">
        The layout uses CSS Flexbox for proper alignment and responsive behavior.
        Both sidebars are optional and can be conditionally rendered based on your needs.
      </p>

      <div className="bg-muted p-4 rounded-lg mb-4">
        <code className="text-sm text-foreground">
          {`<HolyGrailLayout
  locale="en"
  leftSidebar={<LeftSidebar />}
  rightSidebar={<RightSidebar />}
>
  <MainContent />
</HolyGrailLayout>`}
        </code>
      </div>
    </section>

    <section id="conclusion" className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Conclusion</h2>
      <p className="text-muted-foreground">
        The Holy Grail layout is perfect for documentation sites, dashboards,
        and content management systems where you need multiple areas of information
        accessible simultaneously.
      </p>
    </section>
  </div>
);

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HolyGrailExamplePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <HolyGrailLayout
      locale={locale}
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
    >
      <MainContent />
    </HolyGrailLayout>
  );
}
