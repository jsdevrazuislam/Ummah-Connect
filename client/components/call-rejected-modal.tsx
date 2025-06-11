"use client"
import { useCallStore, useCallActions } from '@/hooks/use-call-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, UserX, X } from 'lucide-react';

const CallRejectedModal = () => {

    const router = useRouter();
    const { incomingCall, rejectedCallInfo, callStatus } = useCallStore();
    const { setCallStatus } = useCallActions();

    if (!callStatus) return null;


    return (
        <>
            <Dialog open={!!callStatus && !incomingCall} onOpenChange={() => setCallStatus(null)}>
                <DialogHeader className="sr-only">
                    <DialogTitle>Call Rejected</DialogTitle>
                    <DialogDescription>call rejected call.</DialogDescription>
                </DialogHeader>
                <DialogContent className="max-w-xs rounded-xl bg-gray-800 text-white border-none">
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        {callStatus === 'rejected' && (
                            <>
                                <div className="bg-red-500/20 p-4 rounded-full">
                                    <X className="h-8 w-8 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold">Call Declined</h2>
                                <p className="text-gray-300 text-center">
                                   The user {rejectedCallInfo?.callerName} is currently busy or declined your call.
                                </p>
                            </>
                        )}
                        {callStatus === 'missed' && (
                            <>
                                <div className="bg-yellow-500/20 p-4 rounded-full">
                                    <Clock className="h-8 w-8 text-yellow-500" />
                                </div>
                                <h2 className="text-xl font-bold">Missed Call</h2>
                                <p className="text-gray-300 text-center">
                                    {incomingCall?.callerName} is unavailable right now
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4 text-white border-white/30 hover:bg-white/10"
                                    onClick={() => {
                                        setCallStatus(null);
                                    }}
                                >
                                    Call Back
                                </Button>
                            </>
                        )}
                        {callStatus === 'ended' && (
                            <>
                                <div className="bg-blue-500/20 p-4 rounded-full">
                                    <UserX className="h-8 w-8" />
                                </div>
                                <h2 className="text-xl font-bold">Call Ended</h2>
                                <p className="text-gray-300 text-center">
                                    The call has been ended
                                </p>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CallRejectedModal