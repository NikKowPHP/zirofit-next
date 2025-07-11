import PublicLayout from "../components/layouts/PublicLayout";
import TrainerSearch from "@/components/home/TrainerSearch";
import type { Metadata } from "next";
        
export const metadata: Metadata = {
  title: "Find Your Perfect Personal Trainer | ZIRO.FIT",
  description: "Search and book certified personal trainers for online or in-person sessions. Achieve your fitness goals with the right expert from ZIRO.FIT.",
  alternates: {
    canonical: "/",
  },
};
        
export default function Home() {
  return (
    <PublicLayout>
      <div className="relative flex items-center justify-center min-h-[calc(100vh-128px)] p-4 sm:p-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-background.jpg')" }} // NOTE: Add a suitable hero image to the /public directory
        >
          <div className="absolute inset-0 bg-black/60"></div> {/* Overlay */}
        </div>
        
        <div className="relative z-10 w-full">
          <TrainerSearch />
        </div>
      </div>
        
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">For Trainers</h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Attract more clients, showcase your results, and grow your fitness business with our all-in-one toolkit.
          </p>
          <div className="mt-10">
            <a
              href="/auth/register"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-8 rounded-md text-base font-semibold transition-colors shadow-lg"
            >
              Create Your Free Profile
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}