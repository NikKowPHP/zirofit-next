
import { getClientDashboardData } from "./actions";
import { notFound } from "next/navigation";
import { EmptyState, Button } from "@/components/ui";
import Link from "next/link";

export default async function ClientDashboardPage() {
    const clientData = await getClientDashboardData();

    if (!clientData) {
        notFound();
    }

    const hasLoggedWorkouts = clientData.exerciseLogs.length > 0;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Welcome, {clientData.name}!</h1>
            {hasLoggedWorkouts ? (
                <div>
                    <p>Your recent activities will show here.</p>
                </div>
            ) : (
                <EmptyState 
                    title="Let's Get Started!"
                    description="Your fitness journey begins now. Log your first workout or find a trainer to guide you."
                    action={
                        <div className="flex gap-4">
                            <Button asChild>
                                <Link href="/client-dashboard/log-workout">Log a Workout</Link>
                            </Button>
                            <Button asChild variant="secondary">
                                <Link href="/trainers">Find a Trainer</Link>
                            </Button>
                        </div>
                    }
                />
            )}
        </div>
    );
}