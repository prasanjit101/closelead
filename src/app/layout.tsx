import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';

import { TRPCReactProvider } from '@/trpc/react';
import { ThemeProvider } from '@/components/theme-providers';
import { Toaster } from "@/components/ui/sonner"
import Script from 'next/script';
import { SuperButton } from '@/components/block/super-btn';
import { env } from '@/env';

export const metadata: Metadata = {
  title: 'Supamanager - your AI-Powered Project Management Tool',
  description:
    'Your automated project management tool that auto-assigns tasks, prioritizes work, and generates standup reports using AI.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  assets: ['/favicon.ico'],
  authors: [{ name: 'Jit', url: 'https://directory.byjit.com' }],
  keywords: [
    "AI project management",
    "AI product management",
    "automated task assignment",
    "standup report generator",
    "engineering team management",
    "Trello alternative"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Supamanager - AI-Powered Project Management',
    description: 'Automated task management for engineering teams',
    url: `${env.NEXT_PUBLIC_APP_URL}`,
    siteName: 'Supamanager',
    images: [
      {
        url: `${env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supamanager - AI-Powered Project Management',
    description: 'Automated task management for engineering teams',
    creator: '@jit_infinity',
    images: [`${env.NEXT_PUBLIC_APP_URL}/og-image.png`],
  },
  category: 'project-management',
  creator: 'Jit',
  metadataBase: new URL(`${env.NEXT_PUBLIC_APP_URL}`),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="preload" href={GeistSans.variable} as="font" type="font/woff2" crossOrigin="anonymous" />
        <Script async src="https://tally.so/widgets/embed.js"></Script>
        <meta name="google-site-verification" content="eV_8lm-A-X7GqiT1epPzizzLuGw542DEMsqF6j1wWQg" />
        <link rel="canonical" href={env.NEXT_PUBLIC_APP_URL} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Supamanager",
            "description": "AI-Powered Project Management Tool",
            "url": env.NEXT_PUBLIC_APP_URL,
            "applicationCategory": "ProjectManagementApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </head>
      <body className="px-4 md:px-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
        <Toaster />
        <SuperButton />
        <Analytics />
      </body>
    </html>
  );
}
