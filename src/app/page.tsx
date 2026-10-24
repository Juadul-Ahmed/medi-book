
import { Navbar } from "@/components/layout/navbar";
import { HomeHero } from "@/components/home/home-hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <HomeHero />
      </main>
    </div>
  );
}
