import { create } from "zustand";
import Cookies from "js-cookie";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "@/constants";
import api from "@/lib/apis/api";
import ApiStrings from "@/lib/apis/api-strings";

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: Cookies.get(ACCESS_TOKEN) || null,
    refreshToken: Cookies.get(REFRESH_TOKEN) || null,
    isAuthenticated: !!Cookies.get(ACCESS_TOKEN),
    user: null,
    isLoading: false,
    setUser: (user) => set({ user }),
    setLogin: (accessToken, refreshToken, user) => {
        Cookies.set(ACCESS_TOKEN, accessToken);
        Cookies.set(REFRESH_TOKEN, refreshToken);
        set({
            accessToken,
            user,
            refreshToken,
            isAuthenticated: true,
        });
    },
    logout: () => {
        set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
        });
        Cookies.remove(REFRESH_TOKEN);
        Cookies.remove(ACCESS_TOKEN);
    },
    initialLoading: async () =>{
        if(get().accessToken){
            const { data } = await api.get(ApiStrings.ME)
            set({
                user: data?.data?.user
            })
        }
    }

}));