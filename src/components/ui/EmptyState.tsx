import { motion } from "framer-motion";
import React from "react";

/**
 * A component to display when a list or area is empty.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} [props.icon] - An optional icon to display.
 * @param {string} props.title - The main title text for the empty state.
 * @param {string} [props.description] - An optional description text.
 * @param {React.ReactNode} [props.action] - An optional action button or link.
 * @returns {JSX.Element} The rendered EmptyState component.
 *
 * @example
 * <EmptyState
 *   icon={<UsersIcon className="h-12 w-12 text-gray-400" />}
 *   title="No clients yet"
 *   description="Get started by adding your first client."
 *   action={<Button>Add Client</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700"
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}