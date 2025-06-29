import { ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "../ui/button";

export const Hero = () => {
  return (
    <div className="py-16 px-20">
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-600">
          # For SaaS, AI Agents, Directories, Websites & Apps.
        </p>
        <h1 className="mt-4 text-5xl text-primary font-bold tracking-tight">
          Automate lead qualification and booking
        </h1>
      </div>

      <div className="mb-8">
        <p className=" text-gray-700">
          Closelead filters out high-value leads that are more likely to close and helps you convert them effectively.
        </p>
      </div>

      <div className="mb-10">
        <p className="text-gray-700">
          It eliminates the tedious process of manual lead qualification and follow-up delays,
          preventing high-value leads from going cold. It provides instant
          response to form submissions, ensures consistent AI scoring, and
          automates booking links, allowing sales teams to focus on qualified
          leads and accelerate conversions.
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
