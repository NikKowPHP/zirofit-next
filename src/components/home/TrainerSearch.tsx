"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BuildingStorefrontIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

export default function TrainerSearch() {
  const [activeTab, setActiveTab] = useState<"in-person" | "online">("in-person");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    if (activeTab === "in-person" && location) {
      searchParams.set("location", location);
    }
    searchParams.set("type", activeTab);
    router.push(`/trainers?${searchParams.toString()}`);
  };

  const TabButton = ({ label, tabId, icon: Icon }: { label: string; tabId: "in-person" | "online"; icon: React.ElementType; }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center px-4 py-2 text-md font-medium transition-colors border-b-2 ${
        activeTab === tabId
          ? "border-[var(--primary-blue)] text-neutral-900 dark:text-white"
          : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 tracking-tight">Find your expert.</h1>
      <h2 className="text-xl md:text-2xl text-center text-neutral-600 dark:text-neutral-400 mb-10">
        Search thousands of certified trainers to achieve your fitness goals.
      </h2>
      <div className="flex justify-center mb-4">
        <TabButton label="In-Person" tabId="in-person" icon={BuildingStorefrontIcon} />
        <TabButton label="Online" tabId="online" icon={VideoCameraIcon} />
      </div>
      <div className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className={activeTab === "in-person" ? "md:col-span-1" : "md:col-span-2"}>
            <label htmlFor="search-query" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Specialty or Trainer Name
            </label>
            <Input id="search-query" type="text" placeholder="e.g., 'Yoga', 'Strength Training'" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
          </div>
          {activeTab === "in-person" && (
            <div className="md:col-span-1">
              <label htmlFor="search-location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Location
              </label>
              <Input id="search-location" type="text" placeholder="City or ZIP code" value={location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} />
            </div>
          )}
          <div className="md:col-span-1">
            <Button type="submit" className="w-full" size="lg">Search</Button>
          </div>
        </form>
      </div>
    </div>
  );
}