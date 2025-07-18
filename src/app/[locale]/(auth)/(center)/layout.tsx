import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-muted/30">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <div className="text-3xl font-bold text-primary">CFIPros</div>
          </Link>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-foreground">
              Master Aviation Knowledge{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Join thousands of aviation professionals who trust CFIPros for their certification success.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-foreground">Comprehensive ACS coverage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-foreground">AI-powered study analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <span className="text-foreground">Interactive learning tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8 lg:hidden">
            <div className="text-2xl font-bold text-primary">CFIPros</div>
          </Link>
          {props.children}
        </div>
      </div>
    </div>
  );
}
