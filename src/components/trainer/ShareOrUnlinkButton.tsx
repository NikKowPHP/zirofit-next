
"use client";

import { useState } from "react";
import { Button, DeleteConfirmationModal } from "@/components/ui";
import { shareDataWithTrainer, unlinkFromTrainer } from "@/app/[locale]/client-dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShareOrUnlinkButtonProps {
    trainerUsername: string;
    trainerName: string;
    isAlreadyLinked: boolean;
}

export default function ShareOrUnlinkButton({ trainerUsername, trainerName, isAlreadyLinked }: ShareOrUnlinkButtonProps) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleShare = async () => {
        setIsPending(true);
        const result = await shareDataWithTrainer(trainerUsername);
        if (result.success) {
            toast.success(result.message);
            router.refresh(); 
        } else {
            toast.error(result.error);
        }
        setIsShareModalOpen(false);
        setIsPending(false);
    };

    const handleUnlink = async () => {
        setIsPending(true);
        const result = await unlinkFromTrainer(); // This action knows the current user and their linked trainer
        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setIsUnlinkModalOpen(false);
        setIsPending(false);
    };
    
    if (isAlreadyLinked) {
        return (
            <>
                <DeleteConfirmationModal
                    isOpen={isUnlinkModalOpen}
                    setIsOpen={setIsUnlinkModalOpen}
                    onConfirm={handleUnlink}
                    isPending={isPending}
                    title={`Unlink from ${trainerName}?`}
                    description="This trainer will no longer see your new workout data. You can always re-link later."
                    confirmButtonText="Unlink"
                    confirmButtonVariant="danger"
                />
                <Button size="lg" variant="danger" onClick={() => setIsUnlinkModalOpen(true)}>
                    Unlink from {trainerName}
                </Button>
            </>
        );
    }

    return (
        <>
            <DeleteConfirmationModal
                isOpen={isShareModalOpen}
                setIsOpen={setIsShareModalOpen}
                onConfirm={handleShare}
                isPending={isPending}
                title={`Share Data with ${trainerName}?`}
                description="By sharing your data, this trainer will be able to see your workout logs and progress. You can revoke access at any time from your dashboard."
                confirmButtonText="Share Data"
                confirmButtonVariant="primary"
            />
            <Button size="lg" onClick={() => setIsShareModalOpen(true)}>
                Share My Data with {trainerName}
            </Button>
        </>
    );
}