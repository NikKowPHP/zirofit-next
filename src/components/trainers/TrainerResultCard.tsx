import Link from 'next/link';
import Image from 'next/image';

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
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-shrink-0">
        <Image
          src={trainer.profile.profilePhotoPath || '/default-profile.jpg'}
          alt={trainer.name}
          width={100}
          height={100}
          className="rounded-full object-cover w-24 h-24"
        />
      </div>
      <div className="flex-grow text-center md:text-left">
        <Link href={`/trainer/${trainer.username}`}>
          <h2 className="text-xl font-bold text-indigo-600 hover:underline">{trainer.name}</h2>
        </Link>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">{trainer.profile.certifications}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{trainer.profile.location}</p>
      </div>
      <div className="flex-shrink-0 md:ml-auto">
         <Link href={`/trainer/${trainer.username}`} className="inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 px-4 py-2 text-sm w-full md:w-auto">
            View Profile
         </Link>
      </div>
    </div>
  );
}
