"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <ErrorState
        title={t("title")}
        description={t("description")}
        onRetry={() => reset()}
        retryButtonText={t("retryButton")}
      />
    </div>
  );
}