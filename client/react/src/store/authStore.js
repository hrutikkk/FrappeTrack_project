import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useTimerStore } from "./timerStore";

export const useAuthStore = create((set, get) => ({
    user: null,
    authLoading: false,
    isAuthenticated: false,
    isCheckingAuth: true,
    error: null,
    authInitialized: false,
    bootstrapped: false, 

    login: async (email, password) => {
        set({ authLoading: true })
        try {
            const res = await axiosInstance.post(
                "/api/method/frappetrack.api.user.login_with_email",
                {
                    email,
                    password
                },
            );
            set({
                isAuthenticated: true, authLoading: false
            })
            await get().fetchProfile();
            console.log("login res", res.data)
            toast.success("Logged in successfully")

            return res;
        } catch (error) {
            console.log("error in login: ", error)
            set({ isAuthenticated: false, authLoading: false, authInitialized: false })
        }
    },

    initAuth: async () => {

        try {
            const res = await axiosInstance.get("/api/method/frappetrack.api.user.get_employee_profile");
            
            if (res.data?.message?.user) {
                set({ user: res.data.message.user, isAuthenticated: true, authInitialized: true });
            } else {
                set({ user: null, isAuthenticated: false, authInitialized: true });
            }
        } catch (err) {
            set({ user: null, isAuthenticated: false, authInitialized: true });
        }
    },
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

    fetchProfile: async () => {
        try {
            const res = await axiosInstance.get(
                "/api/method/frappetrack.api.user.get_employee_profile",
                { withCredentials: true }
            );

            console.log("response ", res)
            const profile = res.data?.message?.user;
            console.log("profile", profile)
            // Only set user if profile exists
            if (profile) {
                set({ user: profile, authInitialized: true });
                return true;
            }

            //  DO NOTHING if profile not ready yet
            return false;
        } catch (err) {
            console.error("Profile fetch failed:", err);
            return false;
        }
    },
 
    logout: async () => {
        // This function logged out user and removes cookies
        try {
            const res = await axiosInstance.delete("/api/method/frappetrack.api.user.logout_user",{ withCredentials: true });
            set({ user: null, isAuthenticated: false, authInitialized: true,authLoading:false });
            // console.log(res);
            return true
            
        } catch (error) {
            console.log("Logged out error",error)
            
        }
    },
}));