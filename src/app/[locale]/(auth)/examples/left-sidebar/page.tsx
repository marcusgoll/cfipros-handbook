import { LeftSidebarLayout } from '@/components/layouts/LeftSidebarLayout';

// Example Sidebar Content
const Sidebar = () => (
  <div>
    <h3 className="text-lg font-semibold mb-4 text-foreground">Course Modules</h3>
    <nav className="space-y-1">
      <a href="#" className="block px-3 py-2 rounded-md text-sm bg-accent text-foreground">
        Module 1: Introduction
      </a>
      <a href="#" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Module 2: Fundamentals
      </a>
      <a href="#" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Module 3: Advanced Topics
      </a>
      <a href="#" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Module 4: Practical Applications
      </a>
      <a href="#" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
        Module 5: Assessment
      </a>
    </nav>
    
    <div className="mt-8 p-4 bg-chart-1/10 border border-chart-1/20 rounded-lg">
      <h4 className="text-sm font-medium mb-2 text-chart-1">Progress</h4>
      <div className="w-full bg-muted rounded-full h-2 mb-2">
        <div className="bg-chart-1 h-2 rounded-full" style={{ width: '60%' }}></div>
      </div>
      <p className="text-xs text-muted-foreground">3 of 5 modules completed</p>
    </div>
    
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3 text-foreground">Resources</h4>
      <div className="space-y-2">
        <a href="#" className="flex items-center text-xs text-muted-foreground hover:text-foreground">
          <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Study Guide
        </a>
        <a href="#" className="flex items-center text-xs text-muted-foreground hover:text-foreground">
          <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Video Lectures
        </a>
        <a href="#" className="flex items-center text-xs text-muted-foreground hover:text-foreground">
          <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Practice Tests
        </a>
      </div>
    </div>
  </div>
);

// Main Content
const MainContent = () => (
  <div className="prose prose-sm max-w-none">
    <h1 className="text-3xl font-bold mb-6 text-foreground">Left Sidebar Layout</h1>
    
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Module 1: Introduction</h2>
      <p className="text-muted-foreground mb-4">
        The left sidebar layout is perfect for applications that need persistent navigation 
        alongside the main content. This layout is commonly used in documentation sites, 
        learning management systems, and administrative dashboards.
      </p>
      
      <h3 className="text-xl font-semibold mb-3 text-foreground">Key Features</h3>
      <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
        <li>Persistent navigation sidebar</li>
        <li>Configurable sidebar width (sm, md, lg)</li>
        <li>Responsive design</li>
        <li>Scrollable content areas</li>
        <li>Theme-aware styling</li>
      </ul>
      
      <div className="bg-muted p-6 rounded-lg mb-6">
        <h4 className="text-lg font-medium mb-3 text-foreground">Code Example</h4>
        <pre className="text-sm text-foreground overflow-x-auto">
{`<LeftSidebarLayout
  locale="en"
  sidebar={<Sidebar />}
  sidebarWidth="md"
>
  <MainContent />
</LeftSidebarLayout>`}
        </pre>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-foreground">Use Cases</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-border rounded-lg">
          <h4 className="font-medium mb-2 text-foreground">Documentation</h4>
          <p className="text-sm text-muted-foreground">
            Perfect for technical documentation with hierarchical navigation.
          </p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <h4 className="font-medium mb-2 text-foreground">E-Learning</h4>
          <p className="text-sm text-muted-foreground">
            Ideal for course modules with progress tracking and resources.
          </p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <h4 className="font-medium mb-2 text-foreground">Admin Panels</h4>
          <p className="text-sm text-muted-foreground">
            Great for dashboard interfaces with multiple sections.
          </p>
        </div>
        <div className="p-4 border border-border rounded-lg">
          <h4 className="font-medium mb-2 text-foreground">Content Management</h4>
          <p className="text-sm text-muted-foreground">
            Useful for CMS interfaces with content categorization.
          </p>
        </div>
      </div>
      
      <div className="bg-chart-2/10 border border-chart-2/20 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2 text-chart-2">💡 Pro Tip</h4>
        <p className="text-sm text-muted-foreground">
          Use the left sidebar layout when your navigation is hierarchical and users 
          need to maintain context while browsing through different sections.
        </p>
      </div>
    </div>
  </div>
);

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LeftSidebarExamplePage({ params }: PageProps) {
  const { locale } = await params;
  
  return (
    <LeftSidebarLayout
      locale={locale}
      sidebar={<Sidebar />}
      sidebarWidth="md"
    >
      <MainContent />
    </LeftSidebarLayout>
  );
}