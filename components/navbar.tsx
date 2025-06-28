"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-black">Autoleadflow</span>
      </div>
      
      <Button 
        variant="outline" 
        className="border-black text-black hover:bg-black hover:text-white transition-colors"
      >
        Try now
      </Button>
    </nav>
  );
}