"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallActions, useCallStore } from "@/hooks/use-call-store";
import { useAuthStore } from "@/store/store";

export function StreamEndedModal() {
    const router = useRouter();
    const { showEndModal, hostUsername } = useCallStore()
    const { setShowEndModal } = useCallActions()
    const { user } = useAuthStore()

    if (!showEndModal) return null;
    if (hostUsername === user?.username) return null;


    return (
        <Dialog open={!!showEndModal} onOpenChange={(isOpen) => !isOpen && setShowEndModal(false)}>
            <DialogContent className="sm:max-w-md bg-background rounded-lg" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
                        Live Stream Ended
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center py-4">
                    <div className="mb-6 text-center">
                        <p className="text-gray-600 dark:text-white mb-2">
                            The host has ended the live stream.
                        </p>
                        <p className="text-gray-500 dark:text-white text-sm">
                            You'll be redirected shortly...
                        </p>
                    </div>

                    <div className="flex gap-3 w-full">
                        <Button
                            className="flex-1"
                            onClick={() => {
                                setShowEndModal(false)
                                router.push(`/${hostUsername}`);
                            }}
                        >
                            Visit Host Profile
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}