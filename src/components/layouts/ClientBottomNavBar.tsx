
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon as HomeIconOutline,
  ClipboardDocumentListIcon as ClipboardDocumentListIconOutline,
  ChartBarIcon as ChartBarIconOutline,
  UserCircleIcon as UserCircleIconOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

export default function ClientBottomNavBar() {
  const pathname = usePathname();
  // Using a generic namespace, adjust if you have a client-specific one
  const t = useTranslations('TrainerDashboardLayout'); 

  const navigation = [
    { name: t('dashboard'), href: "/client-dashboard", outlineIcon: HomeIconOutline, solidIcon: HomeIconSolid },
    { name: "Log Workout", href: "/client-dashboard/log-workout", outlineIcon: ClipboardDocumentListIconOutline, solidIcon: ClipboardDocumentListIconSolid },
    { name: "My Progress", href: "/client-dashboard/my-progress", outlineIcon: ChartBarIconOutline, solidIcon: ChartBarIconSolid },
    { name: "My Trainer", href: "/client-dashboard/my-trainer", outlineIcon: UserCircleIconOutline, solidIcon: UserCircleIconSolid },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-black/10 dark:border-white/10 bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-xl">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/client-dashboard"
              ? pathname.endsWith(item.href) && !pathname.includes('/log-workout') && !pathname.includes('/my-progress') && !pathname.includes('/my-trainer')
              : pathname.startsWith(item.href);
          const Icon = isActive ? item.solidIcon : item.outlineIcon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="inline-flex flex-col items-center justify-center pt-2 pb-1 group"
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive
                    ? "text-indigo-500 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                }`}
              />
              <span className={`text-xs transition-colors ${
                  isActive
                    ? "text-indigo-500 dark:text-indigo-400 font-semibold"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}