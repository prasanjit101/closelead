import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <HeroSection />
    </div>
  );
}