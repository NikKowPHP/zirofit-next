// src/components/layouts/BottomNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

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