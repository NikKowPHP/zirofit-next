
import MyTrainer from "@/components/clients/dashboard/MyTrainer";
import { getClientDashboardData } from "../actions";
import { notFound } from "next/navigation";

export default async function MyTrainerPage() {
    const clientData = await getClientDashboardData();

    if (!clientData) {
        return notFound();
    }
    
    return <MyTrainer trainer={clientData.trainer} />;
}