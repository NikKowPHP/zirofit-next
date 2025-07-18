'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    startTransition(() => {
      // Manually construct the new path
      const pathWithoutLocale = pathname.startsWith(`/${locale}`)
        ? pathname.slice(`/${locale}`.length)
        : pathname;
      
      // Ensure the root path is handled correctly
      const newPath = `/${nextLocale}${pathWithoutLocale || '/'}`;
      router.replace(newPath);
    });
  };

  return (
    <select
      defaultValue={locale}
      onChange={onSelectChange}
      disabled={isPending}
      className="p-2 rounded-full border border-neutral-300 bg-white text-neutral-900 
                 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 
                  text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
    >
      <option value="en">English</option>
      <option value="pl">Polski</option>
    </select>
  );
}