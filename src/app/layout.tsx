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
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <ClerkProvider>
          <header className="border-b border-stone-200 bg-white">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                Scent Match
              </Link>
              <Suspense>
                <nav className="flex items-center gap-3 text-sm">
                  <Show when="signed-out">
                    <SignInButton>
                      <button className="rounded-full px-4 py-2 font-medium hover:bg-stone-100">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="rounded-full bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700">
                        Sign up
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <Link
                      href="/collection"
                      className="rounded-full px-4 py-2 font-medium hover:bg-stone-100"
                    >
                      My collection
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
