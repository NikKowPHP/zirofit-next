import Image from "next/image";
import PublicLayout from "../components/layouts/PublicLayout"; // Import the layout

export default function Home() {
  return (
    <PublicLayout> {/* Wrap content with PublicLayout */}
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          {/* Content from Laravel welcome page - simplified for now */}
          <div className="flex flex-col justify-center items-center gap-[10px] py-16">
            <div className="w-full max-w-5xl mx-auto">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-center text-gray-900 leading-tight">
                  Transform Bodies, <br />Build Your Empire
                </h1>
              </div>
            </div>
            <div className="outline-none flex flex-col justify-start flex-shrink-0 transform-none max-w-[600px] mx-auto mt-4">
              <h2 className="text-xl md:text-2xl leading-[33.6px] text-center text-gray-600">
                Attract More Clients, Showcase Your Results, and Grow Your Fitness Business
              </h2>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 p-0 m-0 pt-12">
              <a href="/trainers" // Link to trainer discovery page
                className="flex items-center justify-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 min-w-[210px] py-3 px-8 rounded-full text-lg font-semibold transition-colors">
                See Case Study (Find Trainers)
              </a>
              <a href="/auth/register"
                className="flex items-center justify-center border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 min-w-[210px] py-3 px-8 rounded-full text-lg font-semibold transition-colors">
                Sign Up
              </a>
            </div>
          </div>
        </main>
        {/* Footer is part of PublicLayout, so no need for the one from original page.tsx here */}
      </div>
    </PublicLayout>
  );
}
