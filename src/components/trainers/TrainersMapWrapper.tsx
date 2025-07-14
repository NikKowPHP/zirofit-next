"use client";

import dynamic from "next/dynamic";
import type { Trainer } from "@/lib/api/trainers";

const TrainersMap = dynamic(() => import('@/components/trainers/TrainersMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><p>Loading map...</p></div>
});

interface TrainersMapWrapperProps {
  trainers: Trainer[];
}

export default function TrainersMapWrapper({ trainers }: TrainersMapWrapperProps) {
  return <TrainersMap trainers={trainers} />;
}