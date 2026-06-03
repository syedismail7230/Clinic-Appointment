import Hero from "./components/Hero";
import ProblemSection from "./components/ProblemSection";
import Features from "./components/Features";
import SupportWidget from "./components/SupportWidget";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-[Geist,sans-serif]" style={{ fontFamily: "'Geist Variable', sans-serif" }}>
      <Hero />
      <ProblemSection />
      <Features />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <SupportWidget />
    </div>
  );
}
