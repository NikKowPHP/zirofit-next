
import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

interface ExerciseData {
  name: string;
  muscleGroup: string;
  equipment: string;
  description: string;
}

async function seedExercises() {
  console.log("Starting to seed exercises...");

  try {
    const exercisesPath = path.join(__dirname, "data", "exercises.json");
    const exercisesJson = await fs.readFile(exercisesPath, "utf-8");
    const exercisesData: ExerciseData[] = JSON.parse(exercisesJson);

    console.log(`Found ${exercisesData.length} exercises to seed.`);

    for (const exercise of exercisesData) {
      await prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {},
        create: {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          description: exercise.description,
        },
      });
    }

    console.log("Successfully seeded exercises.");
  } catch (error) {
    console.error("Failed to seed exercises:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises();