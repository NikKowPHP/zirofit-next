
"use client";

import { motion } from "framer-motion";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

/**
 * A component to display when an error occurs.
 *
 * @example
 * <ErrorState
 *   title="Could not load data"
 *   description="There was a problem fetching the required information."
 *   onRetry={() => refetch()}
 *   retryButtonText="Retry"
 * />
 */
export function ErrorState({
  title = "An error occurred",
  description,
  onRetry,
  retryButtonText = "Try Again",
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30"
    >
      <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-300 max-w-sm">
          {description}
        </p>
      )}
      {onRetry && (
        <div className="mt-6">
          <Button variant="danger" onClick={onRetry}>
            {retryButtonText}
          </Button>
        </div>
      )}
    </motion.div>
  );
}