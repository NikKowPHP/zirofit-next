"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

/**
 * A client component that displays a top-loading bar (nprogress) during page navigations.
 * It listens for route changes and automatically shows and hides the progress bar.
 * This should be placed in the root layout and wrapped in a Suspense boundary.
 *
 * @example
 * // in app/layout.tsx
 * import { Suspense } from 'react';
 * import { TopLoader } from '@/components/layouts/TopLoader';
 *
 * ...
 * <body>
 *   <Suspense fallback={null}>
 *     <TopLoader />
 *   </Suspense>
 *   {children}
 * </body>
 */
export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Find the closest anchor tag
      const anchor = target.closest("a");

      if (anchor) {
        try {
          const targetUrl = new URL(anchor.href);
          const currentUrl = new URL(location.href);

          if (
            targetUrl.origin === currentUrl.origin &&
            targetUrl.pathname !== currentUrl.pathname
          ) {
            NProgress.start();
          }
        } catch (err) {
          // Ignore errors from invalid URLs (e.g., mailto:)
        }
      }
    };

    // Add event listener to the document
    document.addEventListener("click", handleAnchorClick);

    // Clean up
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      NProgress.remove();
    };
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}