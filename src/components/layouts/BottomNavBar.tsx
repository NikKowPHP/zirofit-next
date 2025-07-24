"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon as HomeIconOutline,
  UserCircleIcon as UserCircleIconOutline,
  UserGroupIcon as UserGroupIconOutline,
  CalendarDaysIcon as CalendarDaysIconOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", outlineIcon: HomeIconOutline, solidIcon: HomeIconSolid },
  { name: "Clients", href: "/clients", outlineIcon: UserGroupIconOutline, solidIcon: UserGroupIconSolid },
  { name: "Bookings", href: "/dashboard/bookings", outlineIcon: CalendarDaysIconOutline, solidIcon: CalendarDaysIconSolid },
  { name: "Profile", href: "/profile/edit", outlineIcon: UserCircleIconOutline, solidIcon: UserCircleIconSolid },
];

function BottomNavLink({ href, isActive, name, outlineIcon: OutlineIcon, solidIcon: SolidIcon }: { href: string; isActive: boolean; name: string; outlineIcon: React.ElementType; solidIcon: React.ElementType; }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const Icon = isActive ? SolidIcon : OutlineIcon;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        router.push(href);
      }, 50);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);
  
  return (
    <Link
      href={href}
      onClick={handleClick}
      className="inline-flex flex-col items-center justify-center pt-2 pb-1 group"
    >
      {isLoading ? (
        <svg
          className="animate-spin w-6 h-6 mb-1 text-indigo-500 dark:text-indigo-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Icon
          className={`w-6 h-6 mb-1 transition-colors ${
            isActive
              ? "text-indigo-500 dark:text-indigo-400"
              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          }`}
        />
      )}
      <span className={`text-xs transition-colors ${
          isActive
            ? "text-indigo-500 dark:text-indigo-400 font-semibold"
            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
        }`}>
        {name}
      </span>
    </Link>
  );
}


export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    // Redesigned to mimic iOS Tab Bar with frosted glass effect
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-black/10 dark:border-white/10 bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname.endsWith(item.href) && !pathname.includes('/dashboard/bookings')
              : pathname.includes(item.href.substring(1)); // use substring to avoid leading slash issues if pathname has it
          return (
            <BottomNavLink
              key={item.name}
              href={item.href}
              isActive={isActive}
              name={item.name}
              outlineIcon={item.outlineIcon}
              solidIcon={item.solidIcon}
            />
          );
        })}
      </div>
    </div>
  );
}