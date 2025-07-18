
"use client";

import { useState } from "react";
import { Button, DeleteConfirmationModal } from "@/components/ui";
import { shareDataWithTrainer } from "@/app/[locale]/client-dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShareDataButtonProps {
    trainerUsername: string;
    trainerName: string;
}

export default function ShareDataButton({ trainerUsername, trainerName }: ShareDataButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleConfirm = async () => {
        setIsPending(true);
        const result = await shareDataWithTrainer(trainerUsername);
        if (result.success) {
            toast.success(result.message);
            router.refresh(); // Refresh to update server components state
        } else {
            toast.error(result.error);
        }
        setIsModalOpen(false);
        setIsPending(false);
    };
    
    return (
        <>
            <DeleteConfirmationModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onConfirm={handleConfirm}
                isPending={isPending}
                title={`Share Data with ${trainerName}?`}
                description="By sharing your data, this trainer will be able to see your workout logs and progress. You can revoke access at any time from your dashboard."
                confirmButtonText="Share Data"
                confirmButtonVariant="primary"
            />
            <Button size="lg" onClick={() => setIsModalOpen(true)}>
                Share My Data with {trainerName}
            </Button>
        </>
    )
}