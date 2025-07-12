import PublicLayout from "../components/layouts/PublicLayout";
import TrainerSearch from "@/components/home/TrainerSearch";
import type { Metadata } from "next";
import { Button } from "@/components/ui";
import Link from "next/link";

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
      {/* Hero Section */}
      <div className="flex items-center justify-center text-center bg-transparent pt-20 pb-20">
        <div className="relative z-10 w-full px-4">
          <TrainerSearch />
        </div>
      </div>

      {/* For Trainers Section */}
      <section className="py-20 sm:py-32 bg-neutral-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Grow your training business.
          </h2>
          <p className="mt-6 text-lg text-neutral-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join a community of top-tier professionals. We provide the tools to build your brand, connect with clients, and manage your schedule seamlessly.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/auth/register">
                Create Your Free Profile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}