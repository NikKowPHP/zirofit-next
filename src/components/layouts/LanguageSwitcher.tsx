"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next-intl/navigation";
import { useTransition } from "react";
import { locales } from "@/i18n";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const onSelectChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center space-x-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => onSelectChange(loc)}
          disabled={isPending || locale === loc}
          className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-blue)] focus:ring-offset-[var(--background)] ${
            locale === loc
              ? "bg-[var(--primary-blue)] text-white cursor-not-allowed"
              : "bg-neutral-200/80 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
