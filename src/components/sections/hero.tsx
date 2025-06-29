import { ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "../ui/button";

export const Hero = () => {
  return (
    <div className="container mx-auto px-12 py-16">
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-600">
          # For SaaS, AI Agents, Directories, Websites & Apps.
        </p>
        <h1 className="mt-4 text-5xl text-primary font-bold tracking-tight">
          Automate lead qualification <br /> and booking
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-base text-gray-700">
          Closelead transforms reactive lead handling into a proactive,
          automated system. It instantly qualifies leads, automates follow-ups,
          and streamlines appointment scheduling, ensuring no high-value lead
          goes cold and accelerating your sales cycles.
        </p>
      </div>

      <div className="mb-10">
        <p className="text-base text-gray-700">
          I got sick of the scams, bots, fake clicks, zero returns. So I built a
          better ad network. No fluff, no fraud. Advertisers get real ROI.
          Publishers earn legit revenue. It's advertising that works for
          everyone.
        </p>
      </div>

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button variant="outline">
          <PhoneCall />
          Book a call
        </Button>
        <Button>
          <ArrowRight />
          Try yourself
        </Button>
      </div>
    </div>
  );
};
