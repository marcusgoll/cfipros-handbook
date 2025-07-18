"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-6 relative max-w-none">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="font-bold text-lg">
            CFIPros
          </div>
        </Link>

        {/* Center Navigation - Desktop Only */}
        <nav className="hidden md:flex items-center gap-8 text-sm absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => {
              document.getElementById('acs-extractor')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
          >
            ACS Extractor
          </button>
          <button
            onClick={() => {
              document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
          >
            Resources
          </button>
          <button
            onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => {
              document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
          >
            FAQs
          </button>
        </nav>

        {/* Right Side - Auth + Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 w-9 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            type="button"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
            >
              <path
                d="M3 5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 12H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 19H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </button>

          {/* Desktop Auth */}
          <nav className="hidden md:flex items-center gap-3">
            <SignedOut>
              <Button variant="ghost" size="sm" className="px-4" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button size="sm" className="px-4" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </SignedIn>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden">
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            <nav className="grid grid-flow-row auto-rows-max gap-2">
              <button
                onClick={() => {
                  document.getElementById('acs-extractor')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center rounded-md py-4 px-6 text-lg font-medium hover:bg-muted transition-colors"
              >
                ACS Extractor
              </button>
              <button
                onClick={() => {
                  document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center rounded-md py-4 px-6 text-lg font-medium hover:bg-muted transition-colors"
              >
                Resources
              </button>
              <button
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center rounded-md py-4 px-6 text-lg font-medium hover:bg-muted transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center rounded-md py-4 px-6 text-lg font-medium hover:bg-muted transition-colors"
              >
                FAQs
              </button>
            </nav>

            {/* Mobile Auth */}
            <div className="border-t pt-4 mt-4">
              <SignedOut>
                <div className="space-y-3">
                  <Button variant="ghost" size="lg" className="w-full justify-center py-4 text-lg" asChild>
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button size="lg" className="w-full py-4 text-lg" asChild>
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-center py-4">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10"
                      }
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}