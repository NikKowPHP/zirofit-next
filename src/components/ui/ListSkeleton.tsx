import { Skeleton } from "./Skeleton";
import { Card, CardContent } from "./Card";

/**
 * A generic skeleton loader for list-based views.
 * It displays a series of placeholder cards to indicate content is loading.
 *
 * @param {object} props - The component props.
 * @param {number} [props.count=3] - The number of skeleton items to render.
 * @param {string} [props.className] - Optional additional CSS classes for the container.
 * @returns {JSX.Element} The rendered ListSkeleton component.
 *
 * @example
 * <ListSkeleton count={5} />
 */
export function ListSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}