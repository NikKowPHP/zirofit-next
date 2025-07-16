
"use client";
import { motion } from "framer-motion";
import TrainerResultCard from "./TrainerResultCard";

interface Trainer {
  id: string;
  name: string;
  username: string | null;
  profile: {
    location: string | null;
    certifications: string | null;
    profilePhotoPath: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function TrainerGrid({ trainers }: { trainers: Trainer[] }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {trainers.map((trainer: Trainer) => (
        <motion.div key={trainer.id} variants={itemVariants} className="mb-6" data-testid="trainer-card-container">
          <TrainerResultCard trainer={trainer} />
        </motion.div>
      ))}
    </motion.div>
  );
}