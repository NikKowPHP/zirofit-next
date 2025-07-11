import React from 'react';
import { TrainerCard } from './TrainerCard';
import type { Trainer } from '@/lib/api/trainers';

interface TrainerSearchResultsProps {
  trainers: Trainer[];
  loading: boolean;
  error?: string;
}

export function TrainerSearchResults({ trainers, loading, error }: TrainerSearchResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No trainers found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainers.map((trainer) => (
        <TrainerCard key={trainer.id} trainer={trainer} />
      ))}
    </div>
  );
}