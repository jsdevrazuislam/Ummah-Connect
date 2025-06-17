"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, PhoneOff, X } from "lucide-react";
import { useState } from "react";

interface EndStreamConfirmationProps {
    onConfirm: () => void
    isLoading: boolean
}

export function EndStreamConfirmation({ onConfirm, isLoading }: EndStreamConfirmationProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                className="gap-2 bg-red-500 text-white"
                onClick={() => setIsOpen(true)}
            >
                <PhoneOff className="h-4 w-4" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-lg" onInteractOutside={(e) => {
                    e.preventDefault();
                }}>
                    <DialogHeader>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                                <div className="relative flex items-center justify-center h-12 w-12 bg-red-100 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>

                            <DialogTitle className="text-xl font-semibold">
                                End Live Stream?
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                This will immediately stop your broadcast for all viewers. Are you sure you want to end?
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="gap-2 !justify-center !items-center sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="gap-2"
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            className="gap-2"
                            disabled={isLoading}
                        >
                            <PhoneOff className="h-4 w-4" />
                            {isLoading ? 'Ending...' : 'Yes, End Stream'}
                        </Button>
                    </DialogFooter>

                    <div className="mt-4 text-xs text-gray-500 text-center">
                        <p>Note: This action cannot be undone. Viewers will be redirected.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}