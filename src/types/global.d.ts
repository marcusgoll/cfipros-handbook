declare global {
  interface Window {
    posthog?: {
      capture(event: string, properties?: Record<string, any>): void;
    };
  }
}

export {};
