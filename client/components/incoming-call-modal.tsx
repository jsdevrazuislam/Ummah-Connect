"use client"
import { useCallStore, useCallActions } from '@/hooks/use-call-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Phone, X } from 'lucide-react';
import { useEffect } from 'react';
import { useSocketStore } from '@/hooks/use-socket';
import SocketEventEnum from '@/constants/socket-event';
import { useAuthStore } from '@/store/store';


function IncomingCallNotification() {
    const router = useRouter();
    const { incomingCall } = useCallStore();
    const { acceptCall, rejectCall, setIncomingCall, startRingtone, stopRingtone } = useCallActions();
    const { socket } = useSocketStore()
    const { user } = useAuthStore()

     useEffect(() => {
        if (incomingCall) {
            startRingtone();
        } else {
            stopRingtone();
        }
        return () => {
            stopRingtone();
        };
    }, [incomingCall, startRingtone, stopRingtone]);

    if (!incomingCall) return null;



    const handleAccept = () => {
        acceptCall();
        socket?.emit(SocketEventEnum.CALL_ACCEPTED, {
            roomName: incomingCall?.roomName,
            receiverId: user?.id,
            callerUserId: incomingCall?.from,
        })
        router.push(`/call?room=${incomingCall?.roomName}&type=${incomingCall?.callType}&authToken=${incomingCall.authToken}`);
    };

    const handleDecline = () => {
        rejectCall()
        socket?.emit(SocketEventEnum.CALL_REJECTED, {
            roomName: incomingCall?.roomName,
            rejectedByUserId: user?.id,
            callerUserId: incomingCall?.from,
            callerName: user?.full_name,
            callerAvatar: user?.avatar
        })
        setIncomingCall(null)
    }

    return (
        <>
            <Dialog open={!!incomingCall} onOpenChange={(isOpen) => !isOpen && handleDecline()}>
                <DialogHeader className="sr-only">
                    <DialogTitle>Call Interface</DialogTitle>
                    <DialogDescription>Full-screen one-to-one call.</DialogDescription>
                </DialogHeader>
                <DialogContent className="max-w-xs rounded-xl bg-gray-800 text-white border-none">
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <p className="text-sm text-gray-400">Incoming call</p>
                        <Avatar className="w-24 h-24 mt-4">
                            {incomingCall?.callerAvatar && <AvatarImage src={incomingCall?.callerAvatar} alt={incomingCall?.callerName} />}
                            {!incomingCall?.callerAvatar && <AvatarFallback className="bg-gray-600 text-4xl">
                                {incomingCall?.callerName?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>}
                        </Avatar>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{incomingCall?.callerName}</h2>
                            <p className="text-gray-300">is calling you</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                            <Lock size={12} />
                            <span>End-to-end encrypted</span>
                        </div>

                        <div className="flex justify-between w-full mt-6">
                            <div className="flex flex-col items-center gap-2">
                                <Button onClick={handleDecline} variant="destructive" size="icon" className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600">
                                    <X size={32} />
                                </Button>
                                <span className="text-sm">Decline</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Button onClick={handleAccept} variant="default" size="icon" className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600">
                                    <Phone size={32} />
                                </Button>
                                <span className="text-sm">Accept</span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default IncomingCallNotification