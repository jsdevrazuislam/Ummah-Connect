import api from '@/lib/apis/api';
import { create } from 'zustand';

type CallType = 'audio' | 'video';

interface IncomingCall {
    from: string;
    authToken: string;
    callType: CallType;
    roomName: string;
    callerAvatar?: string
    callerName?: string
}
interface RejectedCallInfo {
    message:string
    roomName: string;
    callerAvatar?: string
    callerName?: string
}

interface CallState {
    incomingCall: IncomingCall | null;
    rejectedCallInfo: RejectedCallInfo | null;
    callStatus: 'rejected' | 'missed' | 'ended' | null
    isCalling: boolean;
    isPlayingRingtone: boolean;
    token: string | null;
    livekitUrl: string | null;
    isFetchingToken: boolean;
    showEndModal?:boolean
    hostUsername?:string
    actions: {
        setIncomingCall: (call: IncomingCall | null) => void;
        setRejectedCallInfo: (rejectedCallInfo: RejectedCallInfo | null) => void;
        setCallStatus: (status: 'rejected' | 'missed' | 'ended' | null) => void;
        startCall: (callType: CallType, roomName: string) => void;
        acceptCall: () => void;
        setShowEndModal: (showEndModal: boolean) => void;
        setHostUsername: (username:string) => void;
        rejectCall: () => void;
        endCall: () => void;
        fetchToken: (roomName: string, identity: string, callType: CallType) => Promise<void>;
        startRingtone: () => void;
        stopRingtone: () => void;
    };
}

export const useCallStore = create<CallState>((set, get) => ({
    incomingCall: null,
    rejectedCallInfo: null,
    isCalling: false,
    token: null,
    livekitUrl: null,
    isFetchingToken: false,
    isPlayingRingtone: false,
    callAttemptTimeoutId: null,
    hasCallTimedOut: false,
    callStatus: null,
    showEndModal: false,
    hostUsername: '',
    actions: {
        setIncomingCall: (call) => set({ incomingCall: call }),
        setShowEndModal: (showEndModal) => set({ showEndModal }),
        setHostUsername: (name) => set({ hostUsername: name }),
        setRejectedCallInfo: (rejectedCallInfo) => {
            set({ rejectedCallInfo })
            get().actions.endCall();
            get().actions.setCallStatus('rejected');
        },
        startRingtone: () => set({ isPlayingRingtone: true }),
        stopRingtone: () => set({ isPlayingRingtone: false }),
        setCallStatus: (callStatus) => set({ callStatus }),

        startCall: () => {
            set({ isCalling: true });
            get().actions.startRingtone();
        },

        acceptCall: () => {
            const call = get().incomingCall;
            if (!call) return;
            set({ isCalling: false, incomingCall: null });
            get().actions.stopRingtone();
        },

        rejectCall: () => {
            get().actions.stopRingtone();
        },

        endCall: () => {
            set({ isCalling: false, token: null, livekitUrl: null, incomingCall: null });
            get().actions.stopRingtone();
        },

        fetchToken: async (roomName, identity) => {
            set({ isFetchingToken: true });
            try {
                const { data } = await api(`/stream/get-token?roomName=${roomName}&identity=${identity}`);
                const tokenData = data?.data;
                set({ token: tokenData.token, livekitUrl: tokenData.livekitUrl, isCalling: true });
            } catch (e) {
                console.error(e);
                get().actions.endCall();
            } finally {
                set({ isFetchingToken: false });
            }
        },
    },
}));

export const useCallActions = () => useCallStore((state) => state.actions);