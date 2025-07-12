import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { MapPinIcon } from '@heroicons/react/24/solid';

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    username: string | null;
    profile: {
      location: string | null;
      certifications: string | null;
      profilePhotoPath: string | null;
    } | null;
  };
}

export default function TrainerResultCard({ trainer }: TrainerCardProps) {
  if (!trainer.profile) return null;

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-shadow duration-300 hover:shadow-md flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-shrink-0">
        <Image
          src={trainer.profile.profilePhotoPath || '/default-profile.jpg'}
          alt={trainer.name}
          width={100}
          height={100}
          className="rounded-full object-cover w-24 h-24 border-2 border-white dark:border-neutral-800 shadow-sm"
        />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <Link href={`/trainer/${trainer.username}`}>
          <h2 className="text-xl font-bold text-[var(--primary-blue)] hover:underline">{trainer.name}</h2>
        </Link>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">{trainer.profile.certifications}</p>
        {trainer.profile.location && (
            <div className="flex items-center justify-center sm:justify-start text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <MapPinIcon className="w-4 h-4 mr-1.5" />
                <span>{trainer.profile.location}</span>
            </div>
        )}
      </div>
      <div className="flex-shrink-0 sm:ml-auto">
         <Button asChild variant="secondary">
            <Link href={`/trainer/${trainer.username}`}>View Profile</Link>
         </Button>
      </div>
    </div>
  );
}