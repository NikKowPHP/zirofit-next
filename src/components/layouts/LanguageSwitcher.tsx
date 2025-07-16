
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <select
      defaultValue={locale}
      onChange={onSelectChange}
      disabled={isPending}
      className="text-sm bg-transparent p-1 rounded-md border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-[var(--primary-blue)]"
    >
      <option value="en">English</option>
      <option value="pl">Polski</option>
    </select>
  );
}