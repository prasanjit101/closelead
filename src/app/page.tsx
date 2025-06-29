import { HydrateClient } from "@/trpc/server";
import { LandingNav } from "@/components/sections/nav";
import { Footer1 } from "@/components/sections/footers";
import { Hero } from "@/components/sections/hero";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex-1 max-w-4xl mx-auto border min-h-screen" itemScope itemType="https://schema.org/WebPage">
        <div
          itemScope
          itemType="https://schema.org/Organization"
          className="hidden"
        >
          <meta itemProp="name" content="Closelead" />
          <meta itemProp="url" content="https://closelead.byjit.com" />
          <meta
            itemProp="logo"
            content="https://closelead.byjit.com/logo.png"
          />
          <meta
            itemProp="description"
            content="AI-Powered Lead Management and Automation Platform"
          />
          <meta itemProp="sameAs" content="https://x.com/jit_infinity" />
        </div>
        <LandingNav />
        <Hero />
        <Footer1 />
      </main>
    </HydrateClient>
  );
}
