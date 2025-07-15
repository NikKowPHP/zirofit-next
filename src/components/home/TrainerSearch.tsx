
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  BuildingStorefrontIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function TrainerSearch() {
  const t = useTranslations('TrainerSearch');
  const tHome = useTranslations('HomePage');

  const [activeTab, setActiveTab] = useState<"in-person" | "online">(
    "in-person"
  );
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 1. Add loading state
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 2. Set loading on submit
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    if (activeTab === "in-person" && location) {
      searchParams.set("location", location);
    }
    searchParams.set("type", activeTab);
    // The component will unmount on navigation, so we don't need to reset the loading state
    router.push(`/trainers?${searchParams.toString()}`);
  };

  const TabButton = ({
    label,
    tabId,
    icon: Icon,
  }: {
    label: string;
    tabId: "in-person" | "online";
    icon: React.ElementType;
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabId)}
      className={`relative flex items-center px-4 py-2 text-md font-medium transition-colors focus:outline-none ${
        activeTab === tabId
          ? "text-neutral-900 dark:text-white"
          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
      {activeTab === tabId && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-blue)]"
          layoutId="underline"
        />
      )}
    </button>
  );

  return (
    <div>

    
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center pt-30">
      <div className="px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 tracking-tight">
          {tHome('mainHeading')}
        </h1>
        <h2 className="text-xl md:text-2xl text-center text-neutral-600 dark:text-neutral-400 mb-10">
          {tHome('subHeading')}
        </h2>
      </div>
      <div className=" w-full p-8">
        <div className="flex justify-center mb-4">
          <TabButton
            label={t('inPerson')}
            tabId="in-person"
            icon={BuildingStorefrontIcon}
          />
          <TabButton label={t('online')} tabId="online" icon={VideoCameraIcon} />
        </div>
        <div className="w-full">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
          >
            <div
              className={
                activeTab === "in-person" ? "md:col-span-1" : "md:col-span-2"
              }
            >
              <Input
                id="search-query"
                type="text"
                placeholder={t('specialtyPlaceholder')}
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                size="lg"
              />
            </div>
            {activeTab === "in-person" && (
              <div className="md:col-span-1">
                <Input
                  id="search-location"
                  type="text"
                  placeholder={t('locationPlaceholder')}
                  value={location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocation(e.target.value)
                  }
                  size="lg"
                />
              </div>
            )}
            <div className="md:col-span-1">
              {/* 3. Make button stateful with loading indicator */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('searching')}
                  </div>
                ) : (
                  t('search')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      </div>
      </div>
  );
}