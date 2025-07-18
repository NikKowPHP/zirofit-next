
"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import Link from "next/link";
import { EmptyState } from "@/components/ui";

interface MyTrainerProps {
    trainer: {
        name: string;
        username: string | null;
        email: string;
    } | null;
}

export default function MyTrainer({ trainer }: MyTrainerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Trainer</CardTitle>
            </CardHeader>
            <CardContent>
                {trainer ? (
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-lg">{trainer.name}</p>
                            <p className="text-sm text-gray-500">{trainer.email}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button asChild>
                                <Link href={`/trainer/${trainer.username}`}>View Profile</Link>
                            </Button>
                            <Button variant="danger" disabled>Unlink From Trainer</Button>
                        </div>
                    </div>
                ) : (
                    <EmptyState 
                        title="You are not linked with a trainer"
                        description="Sharing your progress with a trainer can help you reach your goals faster. Find one that fits your needs!"
                        action={
                            <Button asChild>
                                <Link href="/trainers">Find a Trainer</Link>
                            </Button>
                        }
                    />
                )}
            </CardContent>
        </Card>
    );
}