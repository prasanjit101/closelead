import { HydrateClient } from '@/trpc/server';
import { LandingNav } from '@/components/sections/nav';
import { Hero } from '@/components/sections/hero';
import { Pricing } from '@/components/sections/pricing';
import { Footer1 } from '@/components/sections/footers';

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex-1" itemScope itemType="https://schema.org/WebPage">
        <div itemScope itemType="https://schema.org/Organization" className="hidden">
          <meta itemProp="name" content="Supamanager" />
          <meta itemProp="url" content="https://supamanager.byjit.com" />
          <meta itemProp="logo" content="https://supamanager.byjit.com/logo.png" />
          <meta itemProp="description" content="AI-Powered Project Management Tool" />
          <meta itemProp="sameAs" content="https://x.com/jit_infinity" />
        </div>
        <LandingNav />
        <Hero />
        <div className="container mx-auto pb-20 flex flex-col gap-8 items-center justify-center">
          <h3 className="text-lg md:text-xl text-center max-w-2xl text-gray-700">
            &quot;Powered by AI, it can auto-assign tasks to teams based on their skills,
            create multiple tasks from a single goal, and even predict and autofill the details
            you need — saving you hours of effort and keeping your projects moving without the usual micromanagement.&quot;
          </h3>
          <div className="flex items-center gap-4">
            <span className="block w-12 h-1 bg-primary rounded"></span>
            <h6 className="text-sm text-gray-500">The Project Management tool of the future</h6>
            <span className="block w-12 h-1 bg-primary rounded"></span>
          </div>
        </div>
        <Pricing />
        <Footer1 />
      </main>
    </HydrateClient>
  );
}
