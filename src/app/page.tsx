
import { Footer } from "@/components/layout/footer";
import { HomeHero } from "@/components/home/home-hero";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { MedicalSpecialties } from "@/components/home/medical-specialties";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      

      <main>
        <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 sm:px-7 sm:pt-7 lg:px-10">
          <HomeHero />
        </div>

        <div className="mt-16 sm:mt-24">
          <WhyChooseUs />
        </div>

        <HowItWorks />

        <MedicalSpecialties />
      </main>

      <Footer />
    </div>
  );
}
