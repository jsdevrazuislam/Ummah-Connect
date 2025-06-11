"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallStore, useCallActions } from "@/hooks/use-call-store";
import { useRouter } from "next/navigation";

export function CallTimeoutModal() {
    const { endCall } = useCallActions();
    const router = useRouter()

    const handleClose = () => {
        endCall()
        router.push('/')
    };


    return (
        <Dialog open={false} onOpenChange={handleClose}>
            <DialogContent className="max-w-sm rounded-xl bg-gray-800 text-white border-none">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Call Unanswered
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-300">
                        The call was not answered. The user might be unavailable. Please
                        try again later.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center mt-4">
                    <Button onClick={handleClose}>
                        Okay
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}