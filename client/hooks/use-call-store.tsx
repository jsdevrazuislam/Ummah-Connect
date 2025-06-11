import api from '@/lib/apis/api';
import { create } from 'zustand';

type CallType = 'audio' | 'video';

interface IncomingCall {
    from: string;
    callType: CallType;
    roomName: string;
    callerAvatar?: string
    callerName?:string
}

interface CallState {
    incomingCall: IncomingCall | null;
    isCalling: boolean;
    token: string | null;
    livekitUrl: string | null;
    isFetchingToken: boolean;
    actions: {
        setIncomingCall: (call: IncomingCall | null) => void;
        startCall: (callType: CallType, roomName: string) => void;
        acceptCall: () => void;
        rejectCall: () => void;
        endCall: () => void;
        fetchToken: (roomName: string, identity: string, callType: CallType) => Promise<void>;
    };
}

export const useCallStore = create<CallState>((set, get) => ({
    incomingCall: null,
    isCalling: false,
    token: null,
    livekitUrl: null,
    isFetchingToken: false,
    actions: {
        setIncomingCall: (call) => set({ incomingCall: call }),

        startCall: (callType, roomName) => {
            set({ isCalling: true });
        },

        acceptCall: () => {
            const call = get().incomingCall;
            if (!call) return;
            set({ isCalling: true, incomingCall: null });
        },

        rejectCall: () => {
            set({ incomingCall: null });
        },

        endCall: () => {
            set({ isCalling: false, token: null, livekitUrl: null, incomingCall: null });
        },

        fetchToken: async (roomName, identity, callType) => {
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