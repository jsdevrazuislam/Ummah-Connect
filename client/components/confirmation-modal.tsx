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
import { CircleAlert, TrashIcon } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    type?: "delete" | "warning" | "info";
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    type = "delete",
    isLoading = false,
}: ConfirmationModalProps) {
    const modalVariants = {
        delete: {
            icon: <TrashIcon className="h-6 w-6" />,
            iconBg: "bg-destructive/15",
            iconColor: "text-destructive",
            buttonVariant: "destructive",
        },
        warning: {
            icon: <CircleAlert className="h-6 w-6" />,
            iconBg: "bg-warning/15",
            iconColor: "text-warning",
            buttonVariant: "warning",
        },
        info: {
            icon: <CircleAlert className="h-6 w-6" />,
            iconBg: "bg-info/15",
            iconColor: "text-info",
            buttonVariant: "default",
        },
    };

    const currentVariant = modalVariants[type];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div
                            className={`${currentVariant.iconBg} ${currentVariant.iconColor} p-3 rounded-full`}
                        >
                            {currentVariant.icon}
                        </div>
                        <DialogTitle className="text-lg font-semibold">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={currentVariant.buttonVariant as "destructive" | "default"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {type === "delete" ? (
                            "Delete"
                        ) : (
                            "Confirm"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}