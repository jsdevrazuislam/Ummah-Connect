"use client"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, } from "lucide-react";
import { useStore } from "@/store/store";
import { useCallActions } from "@/hooks/use-call-store";

export function OutgoingCallModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {

    const { selectedConversation } = useStore()
    const { endCall } = useCallActions()

    const endModal = () => {
        onClose()
        endCall()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onInteractOutside={(e) => {
                e.preventDefault();
            }} className="sm:max-w-md rounded-lg p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Outgoing Call to {selectedConversation?.full_name}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center p-8 space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                            {selectedConversation?.avatar ? <AvatarImage src={selectedConversation?.avatar} /> :
                                <AvatarFallback>{selectedConversation?.full_name?.charAt(0)}</AvatarFallback>}
                        </Avatar>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">{selectedConversation?.full_name}</h3>
                            <p className="text-muted-foreground">
                                Ringing...
                            </p>
                        </div>
                    </div>
                    <div className="flex w-full justify-center space-x-6">
                        <Button
                            variant="destructive"
                            size="lg"
                            className="rounded-full h-16 w-16"
                            onClick={endModal}
                        >
                            <PhoneOff className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Waiting for answer...
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}