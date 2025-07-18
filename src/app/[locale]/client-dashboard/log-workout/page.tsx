
import LogWorkout from "@/components/clients/dashboard/LogWorkout";
import { getClientDashboardData } from "../actions";
import { notFound } from "next/navigation";

export default async function LogWorkoutPage() {
    const clientData = await getClientDashboardData();

    if (!clientData) {
        return notFound();
    }
    
    return <LogWorkout initialExerciseLogs={clientData.exerciseLogs} />;
}