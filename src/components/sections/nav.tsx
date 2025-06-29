"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Logo } from "../block/Logo";

export const LandingNav = () => {
  return (
    <header className="w-full border-b border-gray-100">
      <div className="container mx-auto px-20 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="text-lg" />
          </Link>

          <div className="flex items-center">
            <Button variant="ghost" className="flex items-center gap-1 text-sm font-semibold">
              Log In <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
