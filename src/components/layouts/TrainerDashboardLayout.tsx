
"use client";
import React from "react";
import Link from "next/link";
import {
  UserCircleIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import LogoutButton from "../auth/LogoutButton";
import { usePathname } from "next/navigation";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";
import { useTheme } from "@/context/ThemeContext";
import BottomNavBar from "./BottomNavBar"; // Import the new component
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layouts/LanguageSwitcher";

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
  const { theme } = useTheme();
  const t = useTranslations('TrainerDashboardLayout');

  const navigation = [
    {
      name: t('dashboard'),
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname.endsWith("/dashboard"),
    },
    {
      name: t('profileSettings'),
      href: "/profile/edit",
      icon: UserCircleIcon,
      current: pathname.includes("/profile"),
    },
    {
      name: t('manageClients'),
      href: "/clients",
      icon: UserGroupIcon,
      current: pathname.includes("/clients"),
    },
    {
      name: t('myBookings'),
      href: "/dashboard/bookings",
      icon: CalendarDaysIcon,
      current: pathname.includes("/dashboard/bookings"),
    },
  ];

  return (
    <div
      className={`h-screen flex overflow-hidden bg-neutral-50 dark:bg-black ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-white/60 dark:bg-neutral-900/80 border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col h-full w-full">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ZIRO.FIT
              </span>
            </Link>
          </div>
          <nav className="mt-4 px-4 flex-grow">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors duration-200 ${
                  item.current
                    ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    item.current
                      ? "text-neutral-700 dark:text-neutral-200"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
            {userEmail && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t('loggedInAs', {email: userEmail})}
              </p>
            )}
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {headerTitle || t('header_dashboard')}
            </h1>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <NotificationIndicator />
            </div>
          </div>
        </header>
        {/* Add bottom padding for mobile to avoid overlap with nav bar */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeInOut", duration: 0.4 }}
          className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-20 md:pb-6"
        >
          {children}
        </motion.main>
      </div>

      {/* Mobile Bottom Nav Bar */}
      <BottomNavBar />
    </div>
  );
}