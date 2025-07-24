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
import { useNavigation } from "@/context/NavigationContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", outlineIcon: HomeIconOutline, solidIcon: HomeIconSolid },
  { name: "Clients", href: "/clients", outlineIcon: UserGroupIconOutline, solidIcon: UserGroupIconSolid },
  { name: "Bookings", href: "/dashboard/bookings", outlineIcon: CalendarDaysIconOutline, solidIcon: CalendarDaysIconSolid },
  { name: "Profile", href: "/profile/edit", outlineIcon: UserCircleIconOutline, solidIcon: UserCircleIconSolid },
];

function BottomNavLink({ href, isActive, name, outlineIcon: OutlineIcon, solidIcon: SolidIcon }: { href: string; isActive: boolean; name: string; outlineIcon: React.ElementType; solidIcon: React.ElementType; }) {
  const { setIsNavigating, setOptimisticPath } = useNavigation();
  const router = useRouter();
  const Icon = isActive ? SolidIcon : OutlineIcon;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive) {
      e.preventDefault();
      setIsNavigating(true);
      setOptimisticPath(href);
      router.push(href);
    }
  };
  
  return (
    <Link
      href={href}
      onClick={handleClick}
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
        {name}
      </span>
    </Link>
  );
}


export default function BottomNavBar() {
  const pathname = usePathname();
  const { isNavigating, optimisticPath } = useNavigation();
  const currentPath = isNavigating ? optimisticPath : pathname;

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full border-t border-black/10 dark:border-white/10 bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? currentPath?.endsWith(item.href) && !currentPath?.includes('/dashboard/bookings')
              : currentPath?.includes(item.href.substring(1));
          return (
            <BottomNavLink
              key={item.name}
              href={item.href}
              isActive={isActive ?? false}
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