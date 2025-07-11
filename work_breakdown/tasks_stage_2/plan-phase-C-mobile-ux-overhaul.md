### work_breakdown/tasks/plan-phase-C-mobile-ux-overhaul.md
# **Phase C: Mobile UI/UX Overhaul**

**Goal:** Refactor the primary application layouts and components to be mobile-first. This includes implementing a new bottom navigation bar for the trainer dashboard on mobile devices and ensuring all pages are fully responsive and user-friendly on smaller screens.

---

### 1. Implement Mobile-First Dashboard Navigation

-   `[ ]` **Task 1.1: Create Bottom Navigation Bar Component**

    -   **File:** `src/components/layouts/BottomNavBar.tsx`
    -   **Action:** Create a new client component for the mobile-only bottom navigation bar.
    -   **Content:**
        ```tsx
        // src/components/layouts/BottomNavBar.tsx
        "use client";

        import Link from "next/link";
        import { usePathname } from "next/navigation";
        import {
          HomeIcon,
          UserCircleIcon,
          UserGroupIcon,
          CalendarDaysIcon,
        } from "@heroicons/react/24/solid"; // Use solid icons for active state

        const navigation = [
          { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
          { name: "Clients", href: "/clients", icon: UserGroupIcon },
          { name: "Bookings", href: "/dashboard/bookings", icon: CalendarDaysIcon },
          { name: "Profile", href: "/profile/edit", icon: UserCircleIcon },
        ];

        export default function BottomNavBar() {
          const pathname = usePathname();

          return (
            <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                {navigation.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                    >
                      <item.icon
                        className={`w-6 h-6 mb-1 ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                        }`}
                      />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }
        ```

-   `[ ]` **Task 1.2: Refactor `TrainerDashboardLayout` for Mobile**

    -   **File:** `src/components/layouts/TrainerDashboardLayout.tsx`
    -   **Action:** Modify the layout to hide the desktop sidebar on mobile, remove the old mobile hamburger menu, and integrate the new `BottomNavBar`.
    -   **Content:**
        ```tsx
        // src/components/layouts/TrainerDashboardLayout.tsx
        "use client";
        import React, { useState } from "react";
        import Link from "next/link";
        import { SunIcon, MoonIcon, UserCircleIcon, HomeIcon, UserGroupIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
        import LogoutButton from "../../components/auth/LogoutButton";
        import { usePathname } from "next/navigation";
        import NotificationIndicator from "@/components/notifications/NotificationIndicator";
        import { useTheme } from "@/context/ThemeContext";
        import BottomNavBar from "./BottomNavBar"; // Import the new component

        interface TrainerDashboardLayoutProps {
          children: React.ReactNode;
          headerTitle?: string;
          userEmail?: string;
        }

        export default function TrainerDashboardLayout({
          children,
          headerTitle,
          userEmail,
        }: TrainerDashboardLayoutProps) {
          const pathname = usePathname();
          const { theme, toggleTheme } = useTheme();

          // Sidebar is now for desktop only
          const navigation = [
            { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: pathname === "/dashboard" },
            { name: "Profile Settings", href: "/profile/edit", icon: UserCircleIcon, current: pathname.startsWith("/profile") },
            { name: "Manage Clients", href: "/clients", icon: UserGroupIcon, current: pathname.startsWith("/clients") },
            { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDaysIcon, current: pathname.startsWith("/dashboard/bookings") },
          ];

          return (
            <div className={`h-screen flex overflow-hidden ${theme === "dark" ? "dark" : ""}`}>
              {/* Desktop Sidebar */}
              <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-white dark:bg-gray-800 shadow-md">
                <div className="flex flex-col h-full">
                  <div className="p-6">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ZIRO.FIT</span>
                    </Link>
                  </div>
                  <nav className="mt-6 px-4 flex-grow">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href} className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-2 ${item.current ? "bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"}`}>
                        <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 ${item.current ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"}`} aria-hidden="true" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                    {userEmail && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Logged in as: {userEmail}</p>}
                    <LogoutButton />
                  </div>
                </div>
              </aside>

              {/* Main content area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-gray-800 shadow-sm">
                  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                     <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{headerTitle || "Dashboard"}</h1>
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                        {theme === "light" ? <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" /> : <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
                      </button>
                      <NotificationIndicator />
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
                  {children}
                </main>
              </div>

              {/* Mobile Bottom Nav Bar */}
              <BottomNavBar />
            </div>
          );
        }
        ```

---

### 2. Responsive Page Layout Adjustments

-   `[ ]` **Task 2.1: Make Dashboard Content Responsive**

    -   **File:** `src/app/dashboard/DashboardContent.tsx`
    -   **Action:** Ensure the grid layout stacks into a single column on mobile devices.
    -   **Details:** The `div` with `grid grid-cols-1 lg:grid-cols-3` is already correctly configured for responsiveness. No change needed, but confirm it works as expected during testing.

-   `[ ]` **Task 2.2: Make Profile Editor Layout Responsive**

    -   **File:** `src/components/profile/ProfileEditorLayout.tsx`
    -   **Action:** Modify the flex container to stack vertically on mobile (`flex-col`) and switch to a row on medium screens and up (`md:flex-row`).
    -   **Content:**
        ```tsx
        // src/components/profile/ProfileEditorLayout.tsx
        "use client";

        import React, { Suspense } from "react";
        // ... other imports
        
        // ... (interfaces remain the same)

        // ... (lazy imports remain the same)
        
        const SectionLoadingFallback = () => (
          <div className="p-6  dark:bg-gray-800 shadow-sm rounded-lg">
            Loading section...
          </div>
        );

        export default function ProfileEditorLayout({
          initialData,
        }: ProfileEditorLayoutProps) {
          const searchParams = useSearchParams();
          const selectedSection = searchParams.get("section") || "core-info";
        
          const handleSelectSection = (section: string) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("section", section);
            window.history.pushState(null, "", `?${newSearchParams.toString()}`);
          };
        
          // ... (section components map remains the same)
        
          return (
            // This is the key change: flex-col for mobile, md:flex-row for desktop
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              <ProfileEditorSidebar
                currentSection={selectedSection}
                onSelectSection={handleSelectSection}
              />
              <main className="w-full md:w-3/4 lg:w-4/5">
                <Suspense fallback={<SectionLoadingFallback />}>
                  {/* ... SelectedComponent */}
                </Suspense>
              </main>
            </div>
          );
        }
        ```

-   `[ ]` **Task 2.3: Ensure Public Layout is Responsive**
    -   **File:** `src/components/layouts/PublicLayout.tsx`
    -   **Action:** Verify that the existing mobile menu (hamburger) works correctly and provides access to all necessary public links. The current implementation is already mobile-friendly. No code changes are required, but this task ensures it is not overlooked.

---

### 3. Testing

-   `[ ]` **Task 3.1: Manual Responsive UI Testing**
    -   **Action:** Manually test the application on a small viewport using browser developer tools.
    -   **Steps:**
        1.  Log in as a trainer.
        2.  Verify the bottom navigation bar is visible and the desktop sidebar is hidden.
        3.  Verify the main content area has padding at the bottom (`pb-20`) to prevent the last items from being hidden by the nav bar.
        4.  Navigate to each dashboard page (Dashboard, Clients, Bookings, Profile).
        5.  Confirm that all layouts (grids, flex containers) stack into a single, usable column.
        6.  Confirm that all forms are usable and inputs are not squished.
        7.  Log out and check the public-facing pages (`/`, `/trainers`, `/trainer/[username]`) to ensure they also render correctly on mobile.