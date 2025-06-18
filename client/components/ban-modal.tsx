"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Ban, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { ban_user } from "@/lib/apis/stream";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BanModalProps = {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    username: string;
    streamId: number;
};

export function BanModal({ isOpen, onClose, userId, username, streamId }: BanModalProps) {
    const [banDuration, setBanDuration] = useState<"current" | "24h" | "permanent">("current");
    const [description, setDescription] = useState('')
    const { isPending, mutate } = useMutation({
        mutationFn: ban_user,
        onSuccess: () => {
            onClose()
            setDescription('')
            toast.success(
                `You have banned ${username}. ${banDuration === 'current'
                    ? "They won't be able to join this stream anymore."
                    : banDuration === "24h"
                        ? "They won't be able to join your streams for 24 hours."
                        : "They won't be able to join any of your streams unless you unban them."
                }`
            );
        },
        onError: (error) => {
            toast.error(error?.message)
        }
    })

    const handleBanUser = () => {
        mutate({
            banned_user_id: userId,
            reason: description,
            duration_type: banDuration,
            stream_id: streamId
        })
    };

    const getDurationDescription = () => {
        switch (banDuration) {
            case 'current':
                return "User won't be able to join this current stream";
            case "24h":
                return "User won't be able to join any of your streams for 24 hours";
            case "permanent":
                return "User won't be able to join any of your streams unless you unban them";
            default:
                return "";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Ban className="w-5 h-5 text-red-500" />
                        <DialogTitle>Ban User</DialogTitle>
                    </div>
                    <DialogDescription>
                        You are about to ban <span className="font-semibold">{username}</span> from your stream
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Ban Duration
                        </h4>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setBanDuration('current')}
                                className={`p-3 border rounded-md text-sm transition-colors ${banDuration === "current" ? "bg-red-50 border-red-200 text-red-600" : "hover:bg-muted"
                                    }`}
                            >
                                Current Stream
                            </button>
                            <button
                                onClick={() => setBanDuration("24h")}
                                className={`p-3 border rounded-md text-sm transition-colors ${banDuration === "24h" ? "bg-red-50 border-red-200 text-red-600" : "hover:bg-muted"
                                    }`}
                            >
                                24 Hours
                            </button>
                            <button
                                onClick={() => setBanDuration("permanent")}
                                className={`p-3 border rounded-md text-sm transition-colors ${banDuration === "permanent" ? "bg-red-50 border-red-200 text-red-600" : "hover:bg-muted"
                                    }`}
                            >
                                Permanent
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground">{getDurationDescription()}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Reason for ban</Label>
                        <Textarea
                            id="description"
                            placeholder="Please describe the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-md flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-700">
                            Once banned, the user won't be able to join your stream unless you remove the ban from your stream settings.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleBanUser}
                        disabled={isPending}
                        className="gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="animate-pulse">Banning...</span>
                            </>
                        ) : (
                            <>
                                <Ban className="w-4 h-4" />
                                Confirm Ban
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}