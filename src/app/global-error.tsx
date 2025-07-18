'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen p-4">
          <ErrorState
            title="Something went wrong"
            description="An unexpected error occurred. Please try again in a moment."
            onRetry={() => reset()}
            retryButtonText="Try Again"
          />
        </div>
      </body>
    </html>
  );
}