import { Box } from "@mui/material";
import HeroSection from "./_home/HeroSection";
import ServicesSection from "./_home/ServicesSection";
import AboutSection from "./_home/AboutSection";
import TechStackSection from "./_home/TechStackSection";
import CTASection from "./_home/CTASection";

export default function HomePage() {
  return (
    <Box>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TechStackSection />
      <CTASection />
    </Box>
  );
}
