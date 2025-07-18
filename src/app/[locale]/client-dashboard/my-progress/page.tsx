
import MyProgress from "@/components/clients/dashboard/MyProgress";
import { getClientDashboardData } from "../actions";
import { notFound } from "next/navigation";

export default async function MyProgressPage() {
    const clientData = await getClientDashboardData();

    if (!clientData) {
        return notFound();
    }
    
    return <MyProgress clientData={clientData} />;
}