import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-providers";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { SuperButton } from "@/components/block/super-btn";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Closelead - AI-Powered Lead Management & Automation Platform",
  description:
    "Closelead is an AI-powered lead management and automation platform that eliminates manual lead qualification, automates follow-ups, and accelerates sales cycles.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  assets: ["/favicon.ico"],
  authors: [{ name: "Jit", url: "https://directory.byjit.com" }],
  keywords: [
    "AI lead management",
    "lead automation",
    "lead qualification",
    "automated follow-up",
    "sales acceleration",
    "appointment scheduling",
    "lead scoring",
    "CRM integration",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Closelead - AI-Powered Lead Management & Automation",
    description:
      "Automate lead qualification, follow-up, and appointment scheduling to accelerate your sales cycle.",
    url: `${env.NEXT_PUBLIC_APP_URL}`,
    siteName: "Closelead",
    images: [
      {
        url: `${env.NEXT_PUBLIC_APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Closelead - AI-Powered Lead Management & Automation",
    description:
      "Automate lead qualification, follow-up, and appointment scheduling to accelerate your sales cycle.",
    creator: "@jit_infinity",
    images: [`${env.NEXT_PUBLIC_APP_URL}/og-image.png`],
  },
  category: "sales-automation",
  creator: "Jit",
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
        <link
          rel="preload"
          href={GeistSans.variable}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <Script async src="https://tally.so/widgets/embed.js"></Script>
        <meta
          name="google-site-verification"
          content="eV_8lm-A-X7GqiT1epPzizzLuGw542DEMsqF6j1wWQg"
        />
        <link rel="canonical" href={env.NEXT_PUBLIC_APP_URL} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Closelead",
            description: "AI-Powered Lead Management and Automation Platform",
            url: env.NEXT_PUBLIC_APP_URL,
            applicationCategory: "SalesApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          })}
        </script>
      </head>
      <body className="px-4 md:px-0" suppressHydrationWarning>
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
