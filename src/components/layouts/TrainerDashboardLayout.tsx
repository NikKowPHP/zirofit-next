"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import LogoutButton from "../../components/auth/LogoutButton";
import { usePathname } from "next/navigation";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";
import { useTheme } from "@/context/ThemeContext";

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname === "/dashboard",
    },
    {
      name: "Profile Settings",
      href: "/profile/edit",
      icon: UserCircleIcon,
      current: pathname.startsWith("/profile"),
    },
    {
      name: "Manage Clients",
      href: "/clients",
      icon: UserGroupIcon,
      current: pathname.startsWith("/clients"),
    },
    {
      name: "My Bookings",
      href: "/dashboard/bookings",
      icon: CalendarDaysIcon,
      current: pathname.startsWith("/dashboard/bookings"),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            ZIRO.FIT
          </span>
        </Link>
      </div>
      <nav className="mt-6 px-4 flex-grow">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-2
                        ${
                          item.current
                            ? "bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
            onClick={() => isSidebarOpen && setSidebarOpen(false)}
          >
            <item.icon
              className={`mr-3 h-6 w-6 flex-shrink-0 ${item.current ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300"}`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        {userEmail && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Logged in as: {userEmail}
          </p>
        )}
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div
      className={`h-screen flex overflow-hidden ${theme === "dark" ? "dark" : ""}`}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-white dark:bg-gray-800 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            {sidebarContent}
          </div>
          {/* Backdrop */}
          <div
            className="flex-shrink-0 w-14"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 ml-2 md:ml-0">
                {headerTitle || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
              >
                {theme === "light" ? (
                  <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <NotificationIndicator />
              {userEmail && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {userEmail}
                </span>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
