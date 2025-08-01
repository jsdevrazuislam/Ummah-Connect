"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCallActions, useCallStore } from "@/hooks/use-call-store";

function CallRejectedModal() {
  const { incomingCall, rejectedCallInfo, callStatus } = useCallStore();
  const { setCallStatus } = useCallActions();

  if (!callStatus)
    return null;

  return (
    <>
      <Dialog open={!!callStatus && !incomingCall} onOpenChange={() => setCallStatus(null)}>
        <DialogHeader className="sr-only">
          <DialogTitle>Call Rejected</DialogTitle>
          <DialogDescription>call rejected call.</DialogDescription>
        </DialogHeader>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="max-w-xs rounded-xl bg-gray-800 text-white border-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Rejected Call Modal</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            {callStatus === "rejected" && (
              <>
                <Avatar className="h-20 w-20">
                  {rejectedCallInfo?.callerAvatar
                    ? <AvatarImage src={rejectedCallInfo?.callerAvatar} alt={rejectedCallInfo?.callerName} />
                    : <AvatarFallback>{rejectedCallInfo?.callerName?.charAt(0)}</AvatarFallback> }
                </Avatar>
                <h2 className="text-xl font-bold">Call Declined</h2>
                <p className="text-gray-300 text-center">
                  The user
                  {" "}
                  {rejectedCallInfo?.callerName}
                  {" "}
                  is currently busy declined your call.
                </p>
              </>
            )}
            {callStatus === "missed" && (
              <>
                <Avatar className="h-20 w-20">
                  {rejectedCallInfo?.callerAvatar
                    ? <AvatarImage src={rejectedCallInfo?.callerAvatar} alt={rejectedCallInfo?.callerName} />
                    : <AvatarFallback>{rejectedCallInfo?.callerName?.charAt(0)}</AvatarFallback>}
                </Avatar>
                <h2 className="text-xl font-bold">Missed Call</h2>
                <p className="text-gray-300 text-center">
                  {rejectedCallInfo?.message}
                </p>
                <Button
                  className="mt-4 cursor-pointer"
                  onClick={() => {
                    setCallStatus(null);
                  }}
                >
                  Call Back
                </Button>
              </>
            )}
            {callStatus === "ended" && (
              <>
                <Avatar className="h-20 w-20">
                  {rejectedCallInfo?.callerAvatar
                    ? <AvatarImage src={rejectedCallInfo?.callerAvatar} alt={rejectedCallInfo?.callerName} />
                    : <AvatarFallback>{rejectedCallInfo?.callerName?.charAt(0)}</AvatarFallback>}
                </Avatar>
                <h2 className="text-xl font-bold">Call Ended</h2>
                <p className="text-gray-300 text-center">
                  {rejectedCallInfo?.callerName}
                  {" "}
                  has been ended the call
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CallRejectedModal;
