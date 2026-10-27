import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scent Match",
  description: "Build a perfume collection and get recommendations from the notes you love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-canvas text-ink">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#4f6f5a",
              colorForeground: "#1f2a24",
              colorBackground: "#ffffff",
              borderRadius: "0.75rem",
            },
          }}
        >
          <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-blush ring-4 ring-blush-soft" />
                Scent Match
              </Link>
              <Suspense>
                <nav className="flex items-center gap-3 text-sm">
                  <Show when="signed-out">
                    <SignInButton>
                      <button className="rounded-full px-4 py-2 font-medium hover:bg-sage-soft">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="rounded-full bg-sage px-4 py-2 font-medium text-white hover:bg-sage-dark">
                        Sign up
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <Link
                      href="/collection"
                      className="rounded-full px-4 py-2 font-medium hover:bg-sage-soft"
                    >
                      My collection
                    </Link>
                    <Link
                      href="/favorites"
                      className="rounded-full px-4 py-2 font-medium hover:bg-sage-soft"
                    >
                      Favorites
                    </Link>
                    <UserButton />
                  </Show>
                </nav>
              </Suspense>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
