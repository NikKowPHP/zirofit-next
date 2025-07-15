
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';

export default function SortControl() {
  const t = useTranslations('SortControl');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sortBy', e.target.value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {t('sortBy')}
      </label>
      <select 
        id="sort" 
        onChange={handleSortChange} 
        defaultValue={searchParams.get('sortBy') || 'name_asc'}
        className="h-10 rounded-md border border-neutral-300 bg-white dark:bg-black dark:border-neutral-700 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
      >
        <option value="name_asc">{t('nameAsc')}</option>
        <option value="name_desc">{t('nameDesc')}</option>
        <option value="newest">{t('newest')}</option>
      </select>
    </div>
  );
}