### work_breakdown/tasks/plan-phase-B-search-discovery.md
# **Phase B: Public Search & Discovery Implementation**

**Goal:** To build the complete public-facing search experience. This includes the homepage search bar and a rich, filterable search results page with an integrated map view and trainer preview cards. This phase will deliver a fully functional discovery engine for potential clients.

---

### 1. Homepage Search Component

-   `[x]` **Task 1.1: Create `TrainerSearch` Component**

    -   **File:** `src/components/home/TrainerSearch.tsx`
    -   **Action:** Create a new client component. It will manage the state for search inputs and use the router to navigate to the results page.
    -   **Content:**
        ```tsx
        // src/components/home/TrainerSearch.tsx
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
              className={`flex items-center px-4 py-2 text-lg font-medium rounded-t-lg transition-colors ${
                activeTab === tabId
                  ? "bg-white/90 dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400"
                  : "bg-transparent text-white/80 hover:bg-white/20"
              }`}
            >
              <Icon className="w-6 h-6 mr-2" />
              {label}
            </button>
          );

          return (
            <div className="w-full max-w-3xl mx-auto text-white">
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">Find a Trainer, Book a Session</h1>
              <h2 className="text-lg md:text-xl text-center text-white/80 mb-8">
                Search from thousands of certified trainers to achieve your fitness goals.
              </h2>
              <div className="flex">
                <TabButton label="In-Person" tabId="in-person" icon={BuildingStorefrontIcon} />
                <TabButton label="Online" tabId="online" icon={VideoCameraIcon} />
              </div>
              <div className="bg-white/90 dark:bg-gray-800/90 p-4 sm:p-6 rounded-b-lg rounded-tr-lg shadow-2xl backdrop-blur-sm">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className={activeTab === "in-person" ? "md:col-span-1" : "md:col-span-2"}>
                    <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Specialty or Trainer Name
                    </label>
                    <Input id="search-query" type="text" placeholder="e.g., 'Yoga', 'Strength Training'" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                  {activeTab === "in-person" && (
                    <div className="md:col-span-1">
                      <label htmlFor="search-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <Input id="search-location" type="text" placeholder="City or ZIP code" value={location} onChange={(e) => setLocation(e.target.value)} />
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
        ```

-   `[x]` **Task 1.2: Update Homepage to Use `TrainerSearch`**

    -   **File:** `src/app/page.tsx`
    -   **Action:** Replace the existing hero section with a new structure that includes the `TrainerSearch` component and a background image.
    -   **Content:**
        ```tsx
        // src/app/page.tsx
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
        
              <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">For Trainers</h2>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Attract more clients, showcase your results, and grow your fitness business with our all-in-one toolkit.
                  </p>
                  <div className="mt-8">
                    <a
                      href="/auth/register"
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg text-lg font-semibold transition-colors shadow-md"
                    >
                      Create Your Profile
                    </a>
                  </div>
                </div>
              </section>
            </PublicLayout>
          );
        }
        ```

---

### 2. Search Backend Logic

-   `[x]` **Task 2.1: Enhance `getPublishedTrainers` for Searching and Filtering**

    -   **File:** `src/lib/api/trainers.ts`
    -   **Action:** Modify the `getPublishedTrainers` function to accept search parameters and dynamically build the Prisma query.
    -   **Content:**
        ```typescript
        // src/lib/api/trainers.ts
        import { prisma } from "@/lib/prisma";
        import { transformImagePath } from "../utils";
        
        export async function getPublishedTrainers(
          page = 1,
          pageSize = 10,
          query?: string,
          location?: string
        ) {
          const skip = (page - 1) * pageSize;
        
          const whereClause: any = {
            role: "trainer",
            profile: {
              isNot: null,
            },
          };
        
          if (query) {
            whereClause.OR = [
              { name: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              { profile: { certifications: { contains: query, mode: 'insensitive' } } },
              { profile: { aboutMe: { contains: query, mode: 'insensitive' } } },
              { profile: { methodology: { contains: query, mode: 'insensitive' } } },
              { profile: { philosophy: { contains: query, mode: 'insensitive' } } },
            ];
          }
        
          if (location) {
            if (!whereClause.profile) whereClause.profile = {};
            whereClause.profile.location = { contains: location, mode: 'insensitive' };
          }
        
          try {
            const trainers = await prisma.user.findMany({
              where: whereClause,
              select: {
                id: true,
                name: true,
                username: true,
                profile: {
                  select: {
                    profilePhotoPath: true,
                    location: true,
                    certifications: true,
                    // Note: availability and booking data will be fetched on the individual profile page, not here, to keep this query fast.
                  },
                },
              },
              orderBy: {
                name: "asc",
              },
              skip,
              take: pageSize,
            });
        
            const trainersWithUrls = trainers.map((trainer) => {
              if (trainer.profile) {
                trainer.profile.profilePhotoPath = transformImagePath(trainer.profile.profilePhotoPath);
              }
              return trainer;
            });
        
            const totalTrainers = await prisma.user.count({ where: whereClause });
        
            return {
              trainers: trainersWithUrls,
              totalTrainers,
              currentPage: page,
              totalPages: Math.ceil(totalTrainers / pageSize),
            };
          } catch (error) {
            console.error("Failed to fetch published trainers:", error);
            return {
              trainers: [],
              totalTrainers: 0,
              currentPage: 1,
              totalPages: 0,
              error: "Failed to load trainers.",
            };
          }
        }
        
        // ... getTrainerProfileByUsername remains the same
        ```

---

### 3. Search Results Page

-   `[x]` **Task 3.1: Rebuild Trainers Page as Search Results UI**

    -   **File:** `src/app/trainers/page.tsx`
    -   **Action:** Update the page to process search parameters, fetch data, and render the results in a two-column layout.
    -   **Content:**
        ```tsx
        // src/app/trainers/page.tsx
        import PublicLayout from "@/components/layouts/PublicLayout";
        import { getPublishedTrainers } from "@/lib/api/trainers";
        import Link from "next/link";
        
        export const dynamic = 'force-dynamic'; // Ensure page is re-rendered for each search
        
        // TODO: Import the new components once created in the next steps
        // import TrainerResultCard from '@/components/trainers/TrainerResultCard';
        // import MapView from '@/components/trainers/MapView';
        // import FilterBar from '@/components/trainers/FilterBar';
        
        export default async function TrainersPage({
          searchParams,
        }: {
          searchParams?: { [key: string]: string | string[] | undefined };
        }) {
          const page = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
          const query = typeof searchParams?.q === 'string' ? searchParams.q : undefined;
          const location = typeof searchParams?.location === 'string' ? searchParams.location : undefined;
        
          const { trainers, totalPages, currentPage, error } = await getPublishedTrainers(page, 10, query, location);
        
          return (
            <PublicLayout>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">Search Results</h1>
                {/* <FilterBar />  // Placeholder for filter component */}
        
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {error && <p className="text-red-500">{error}</p>}
                    {!error && trainers.length === 0 && <p>No trainers found matching your criteria.</p>}
                    
                    {/* Placeholder for TrainerResultCard */}
                    {trainers.map((trainer) => (
                        <div key={trainer.id} className="p-4 border rounded-lg shadow-md">
                            <h2 className="text-xl font-bold">{trainer.name}</h2>
                            <p>{trainer.profile?.location}</p>
                            <p>{trainer.profile?.certifications}</p>
                            <Link href={`/trainer/${trainer.username}`} className="text-indigo-600 hover:underline">View Profile</Link>
                        </div>
                    ))}
                    {/* End Placeholder */}

                  </div>
                  <div className="lg:col-span-1">
                    {/* Placeholder for MapView */}
                    <div className="sticky top-24 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p>Map View Placeholder</p>
                    </div>
                  </div>
                </div>
        
                {/* Placeholder for Pagination */}
                <div className="mt-8 flex justify-center">
                  {/* Pagination logic will be added here */}
                </div>
              </div>
            </PublicLayout>
          );
        }
        ```