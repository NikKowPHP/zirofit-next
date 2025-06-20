import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ChecklistItem {
  id: string;
  label: string;
  section: string;
}

interface ProfileChecklistProps {
  items: ChecklistItem[];
}

export default function ProfileChecklist({ items }: ProfileChecklistProps) {
  const searchParams = useSearchParams();

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center">
          <Link
            href={`?section=${item.section}`}
            className={`px-4 py-2 w-full rounded-md ${
              searchParams.get("section") === item.section
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
