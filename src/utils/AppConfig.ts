import type { LocalizationResource } from '@clerk/types';
import type { LocalePrefixMode } from 'next-intl/routing';
import { enUS, frFR } from '@clerk/localizations';

const localePrefix: LocalePrefixMode = 'as-needed';

// CFIPros - Aviation Knowledge Base Platform Configuration
export const AppConfig = {
  name: 'CFIPros',
  fullName: 'CFIPros - Aviation Knowledge Base',
  description: 'Professional aviation knowledge base and training resources for certified flight instructors',
  tagline: 'Master the Skies with Professional Aviation Knowledge',
  domain: 'cfipros.com',
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix,
  version: '1.0.0',
  author: 'CFIPros Team',
  keywords: ['aviation', 'flight training', 'cfi', 'pilot', 'knowledge base', 'regulations'],
};

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
