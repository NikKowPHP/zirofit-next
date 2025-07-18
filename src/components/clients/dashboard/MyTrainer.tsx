
"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, DeleteConfirmationModal } from "@/components/ui";
import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { unlinkFromTrainer } from "@/app/[locale]/client-dashboard/actions";
import { useState } from "react";
import { toast } from "sonner";

interface MyTrainerProps {
    trainer: {
        name: string;
        username: string | null;
        email: string;
    } | null;
}

export default function MyTrainer({ trainer }: MyTrainerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleUnlink = async () => {
        setIsPending(true);
        const result = await unlinkFromTrainer();
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.error);
        }
        setIsModalOpen(false);
        setIsPending(false);
        // Note: The page will need to be reloaded/re-validated to reflect the change.
    }

    return (
        <>
        <DeleteConfirmationModal
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            onConfirm={handleUnlink}
            isPending={isPending}
            title="Unlink from Trainer"
            description="Are you sure you want to unlink from this trainer? They will no longer see your new workout data."
        />
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
                            <Button variant="danger" onClick={() => setIsModalOpen(true)}>
                                Unlink From Trainer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <EmptyState 
                        title="You are not linked with a trainer"
                        description="To link with a trainer, browse the public trainers list, view their profile, and click the 'Share My Data' button."
                        action={
                            <Button asChild>
                                <Link href="/trainers">Find a Trainer</Link>
                            </Button>
                        }
                    />
                )}
            </CardContent>
        </Card>
        </>
    );
}