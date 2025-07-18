import { ClerkProvider } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/libs/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/dashboard';
  let afterSignOutUrl = '/';

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    dashboardUrl = `/${locale}${dashboardUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  return (
    <ClerkProvider
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
      appearance={{
        cssLayerName: 'clerk', // Ensure Clerk is compatible with Tailwind CSS v4
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorBackground: 'hsl(var(--background))',
          colorInputBackground: 'hsl(var(--background))',
          colorInputText: 'hsl(var(--foreground))',
          colorText: 'hsl(var(--foreground))',
          colorTextSecondary: 'hsl(var(--muted-foreground))',
          colorSuccess: 'hsl(var(--primary))',
          colorWarning: 'hsl(var(--ring))',
          colorDanger: 'hsl(var(--destructive))',
          colorNeutral: 'hsl(var(--muted))',
          colorShimmer: 'hsl(var(--muted))',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          borderRadius: 'calc(var(--radius) - 2px)',
        },
        elements: {
          rootBox: 'mx-auto',
          card: 'bg-card border border-border shadow-lg',
          headerTitle: 'text-foreground font-semibold text-2xl',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border border-border bg-background hover:bg-muted transition-colors',
          socialButtonsBlockButtonText: 'text-foreground font-medium',
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors',
          formFieldInput: 'border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2',
          formFieldLabel: 'text-foreground font-medium',
          footerActionLink: 'text-primary hover:text-primary/80 font-medium',
          identityPreviewText: 'text-foreground',
          identityPreviewEditButton: 'text-primary hover:text-primary/80',
          formFieldSuccessText: 'text-primary',
          formFieldErrorText: 'text-destructive',
          otpCodeFieldInput: 'border border-input bg-background text-foreground',
          alertClerkError: 'border border-destructive/50 bg-destructive/10 text-destructive',
        },
      }}
    >
      {props.children}
    </ClerkProvider>
  );
}
