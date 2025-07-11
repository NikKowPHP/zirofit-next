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
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex-shrink-0">
        <Image
          src={trainer.profile.profilePhotoPath || '/default-profile.jpg'}
          alt={trainer.name}
          width={120}
          height={120}
          className="rounded-full object-cover w-24 h-24 md:w-32 md:h-32"
        />
      </div>
      <div className="flex-grow">
        <Link href={`/trainer/${trainer.username}`}>
          <h2 className="text-xl font-bold text-indigo-600 hover:underline">{trainer.name}</h2>
        </Link>
        <p className="font-semibold">{trainer.profile.certifications}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{trainer.profile.location}</p>
        {/* Mini-calendar will be integrated here later if needed */}
      </div>
      <div className="md:w-1/3">
         <Link href={`/trainer/${trainer.username}`} className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            View Profile & Book
         </Link>
      </div>
    </div>
  );
}