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
    bootstrapped: false, // true once initAuth() runs once

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
            // 🔥 Wait a tick, THEN fetch profile

            return res;
        } catch (error) {
            console.log("error in login: ", error)
            set({ isAuthenticated: false, authLoading: false, authInitialized: false })
        }
    },

    initAuth: async () => {
        const { user: currentUser } = get();

        if (currentUser) {
            // User already logged in, just mark initialized
            set({ authInitialized: true });
            return;
        }

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
    // login: async (apiKey, apiSecret) => {
    //     set({ authLoading: true, error: null });

    //     try {
    //         const response = await axiosInstance.post(
    //             "/api/method/frappetrack.api.auth_api.login_custom",
    //             { apiKey, apiSecret }, { withCredentials: true }
    //         );

    //         console.log("Login response:", response.data);
    //         console.log("Cookies after login:", document.cookie);

    //         if (response.data?.message?.success) {
    //             set({
    //                 isAuthenticated: true,
    //                 authLoading: false,
    //                 user: response.data.message.user
    //             });
    //             const sid = response.data.message.user.sid;
    //             window.auth.setSid(sid)
    //             toast.success(response.data.message.message);
    //             return response.data;
    //         }

    //         set({
    //             error: response.data?.message?.message || "Invalid credentials",
    //             authLoading: false,
    //         });
    //         return false;

    //     } catch (err) {
    //         console.error("Login error:", err);
    //         set({
    //             error: "Unable to login.",
    //             authLoading: false,
    //         });
    //         return false;
    //     }
    // },

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

            // ❌ DO NOTHING if profile not ready yet
            return false;
        } catch (err) {
            console.error("Profile fetch failed:", err);
            return false;
        }
    },

    // logout: async () => {
    //     set({ user: null, isAuthenticated: false });
    // },
}));