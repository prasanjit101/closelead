"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageCircle, Edit3 } from "lucide-react";

export function HeroSection() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-4xl mx-auto">
      {/* For whom section */}
      <div className="text-center mb-8">
        <p className="text-lg text-gray-700 font-medium">
          # For SaaS, AI Agents, Directories, Websites & Apps.
        </p>
      </div>

      {/* Main heading */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black text-center mb-8 leading-tight">
        Ads That Actually Deliver
      </h1>

      {/* Subheading */}
      <div className="text-center mb-12 max-w-3xl">
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Google, Facebook, and the rest? Total garbage. They're built for 
          VC-funded startups burning cash, happy to lose $10 for every $5 
          they make. Screw that.
        </p>
        <p className="text-xl text-gray-700 leading-relaxed">
          I got sick of the scams, bots, fake clicks, zero returns. So I built a 
          better ad network. No fluff, no fraud. Advertisers get real ROI. 
          Publishers earn legit revenue. It's advertising that works for 
          everyone.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Button 
          className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-medium rounded-full flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Book a call
        </Button>
        <Button 
          variant="outline" 
          className="border-black text-black hover:bg-gray-50 px-8 py-3 text-lg font-medium rounded-full flex items-center gap-2"
        >
          <ArrowUpRight className="w-5 h-5" />
          Try now
        </Button>
      </div>

      {/* Got a question section */}
      <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-6 max-w-md">
        <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">👤</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-black mb-1 flex items-center gap-2">
            Got a question? <ArrowUpRight className="w-4 h-4" />
          </h3>
          <p className="text-sm text-gray-600">
            DM me on{" "}
            <a href="#" className="underline hover:no-underline">LinkedIn</a>,{" "}
            <a href="#" className="underline hover:no-underline">Twitter</a>{" "}
            or by{" "}
            <a href="#" className="underline hover:no-underline">Email</a>.
          </p>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
          <Edit3 className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
}