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

    login: async (email, password, backend_url) => {
        /*
            Authenticates user:
            takes email and password from fields sends to backend,
            if gets success response sets the store fields to - isAuthenticated: true, authLoading: false & fetches profile
            else Throws error
        */

        set({ authLoading: true })
        try {
            const res = await axiosInstance.post(
                "/method/frappetrack.api.user.login_with_email",
                {
                    email,
                    password,
                    backend_url
                },
            );

            if (res.data.message.success) {
                set({
                    isAuthenticated: true, authLoading: false
                })
                await get().initAuth();

                toast.success("Logged in successfully")

                return res;
            } else {
            toast.error("Invalid Credentials")
            }
        } catch (error) {
            console.log("error in login: ", error)

            set({ isAuthenticated: false, authLoading: false, authInitialized: false })
        }
    },

    initAuth: async () => {
        /*
           Fetches user profile & authorizes user:
           gets user detail and sets the user detail, check whether user is authorized or not
       */
        set({ authLoading: true })
        try {
            const res = await axiosInstance.get("/method/frappetrack.api.user.get_employee_profile");

            if (res.data?.message?.user) {
                set({ user: res.data.message.user, isAuthenticated: true, authInitialized: true });
            } else {
                set({ user: null, isAuthenticated: false, authInitialized: true });
            }
        } catch (err) {
            set({ user: null, isAuthenticated: false, authInitialized: true });
        }
    },

    logout: async () => {
        // This function logged out user and removes cookies
        try {
            const res = await axiosInstance.delete("/method/frappetrack.api.user.logout_user", { withCredentials: true });
            set({ user: null, isAuthenticated: false, authInitialized: true, authLoading: false });
            // console.log(res);
            return true

        } catch (error) {
            console.log("Logged out error", error)

        }
    },
}));