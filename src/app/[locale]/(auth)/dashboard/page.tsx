import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function Dashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  return (
    <div className="space-y-6">
      {/* Big Card Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Private Pilot Handbook Card */}
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
          <CardContent className="p-0">
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-24 w-24 text-primary/30 group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">NEW</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Private Pilot Handbook</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>102 pages</span>
                <span className="flex items-center">
                  {'★★★★★'.split('').map((star, i) => (
                    <span key={i} className="text-yellow-500">{star}</span>
                  ))}
                </span>
              </div>
              <Button asChild className="w-full">
                <Link href={`/${locale}/handbook/private-pilot`}>Open</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instrument Handbook Card (Coming Soon) */}
        <Card className="overflow-hidden opacity-60">
          <CardContent className="p-0">
            <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-24 w-24 text-muted-foreground/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs bg-muted-foreground text-background px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Instrument Handbook</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Coming 2025</span>
              </div>
              <Button disabled className="w-full">
                Locked
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resources Card */}
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Resources</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">ACS Matrix PDF</span>
                  <span className="text-xs text-muted-foreground">(1,234 downloads)</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Checklist Template</span>
                  <span className="text-xs text-muted-foreground">(987 downloads)</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href={`/${locale}/dashboard/resources`}>Browse All</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Bookmarks Card */}
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Bookmarks</h3>
            <div className="space-y-3">
              <Link href="#" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">Lesson 2: Weather Charts</span>
              </Link>
              <Link href="#" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">§61.109 Aeronautical Experience</span>
              </Link>
              <Link href="#" className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">METAR Decoder Tool</span>
              </Link>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href={`/${locale}/dashboard/bookmarks`}>View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ACS Extractor Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold mb-6">ACS Extractor</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="acs-upload"
              className="hidden"
              accept=".csv,.txt"
            />
            <label
              htmlFor="acs-upload"
              className="cursor-pointer space-y-4"
            >
              <div className="mx-auto h-16 w-16 text-muted-foreground/50">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">Drop your Knowledge Test .CSV</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </div>
            </label>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Max 5MB • .csv, .txt • Your data stays private
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
