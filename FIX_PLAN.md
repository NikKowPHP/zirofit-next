# Fix Plan: Missing ProfileChecklist Component

## 1. Create Base Component
**Create `src/components/profile/ProfileChecklist.tsx`:**
```typescript
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ChecklistItem {
  id: string;
  label: string;
  section: string;
}

interface ProfileChecklistProps {
  items: ChecklistItem[];
  activeSection?: string;
}

export default function ProfileChecklist({ items, activeSection }: ProfileChecklistProps) {
  const searchParams = useSearchParams();
  
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center">
          <Link 
            href={`?section=${item.section}`}
            className={`px-4 py-2 w-full rounded-md ${
              activeSection === item.section 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
```

**Verification:**
- File exists at `src/components/profile/ProfileChecklist.tsx`
- Component exports a React function component
- TypeScript interfaces are defined

## 2. Update Navigation
**Modify `src/components/profile/ProfileEditorLayout.tsx`:**
- Import ProfileChecklist component
- Pass section state and checklist items as props

## 3. Cleanup
- Delete `NEEDS_ARCHITECT.md` after successful implementation