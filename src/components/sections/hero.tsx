"use client";

import { ArrowRight, PhoneCall } from "lucide-react";
import { Button } from "../ui/button";
import { signInGoogle } from "@/lib/auth-client";

export const Hero = () => {
  return (
    <div className="px-20 py-20">
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          # For businesses who are having a hard time dealing with every leads.
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-primary">
          Automate lead qualification and booking
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-gray-700 dark:text-white">
          Closelead filters out high-value leads that are more likely to close
          and helps you convert them effectively.
        </p>
      </div>

      <div className="mb-10">
        <p className="text-gray-700 dark:text-white">
          It eliminates the tedious process of manual lead qualification and
          follow-up delays, preventing high-value leads from going cold. It
          provides instant response to form submissions, ensures consistent AI
          scoring, and automates booking links, allowing sales teams to focus on
          qualified leads and accelerate conversions.
        </p>
      </div>

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button variant="outline">
          <PhoneCall />
          Book a call
        </Button>
        <Button
          onClick={() =>
            signInGoogle({
              callbackURL: "/dashboard",
            })
          }
        >
          <ArrowRight />
          Try yourself
        </Button>
      </div>
    </div>
  );
};
