import Link from 'next/link';
import React from 'react';

interface BackLinkProps {
  href: string;
  text: string;
}

const BackLink: React.FC<BackLinkProps> = ({ href, text }) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] transition-all ease-in-out duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:ring-[var(--primary-blue)] px-3 py-1.5 text-xs my-2"
    >
      {text}
    </Link>
  );
};

export default BackLink;