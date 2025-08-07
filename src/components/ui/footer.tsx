'use client';

export function Footer() {
  return (
    <footer className="border-t bg-background border-border">
      <div className="w-full px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 CFIPros. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <button type="button" className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button type="button" className="hover:text-foreground transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
