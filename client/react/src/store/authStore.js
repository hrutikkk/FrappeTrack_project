import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useTimerStore } from "./timerStore";

export const useAuthStore = create((set) => ({
    user: null,
    authLoading: false,
    isAuthenticated: false,
    error: null,


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

    fetchProfile: async (apiKey, apiSecret) => {
        set({ authLoading: true })
        try {

            const res = await axiosInstance.get(
                "api/method/frappetrack.api.user.get_employee_profile",
                {
                    headers: {
                        'Authorization': `token ${apiKey}:${apiSecret}`,
                    },
                }
            );

            const data = res.data;
            console.log("Profile response:", data);

            if (data?.message?.success) {
                localStorage.removeItem("creds")
                set({ user: data.message.user, isAuthenticated: true });

                const creds = [
                    { "apiKey": apiKey },
                    { "apiSecret": apiSecret }
                ]
                await window.electronAPI.saveCredentials(apiKey, apiSecret)
                const response = await window.electronAPI.getCredentials()
                console.log("getting response from main.js: ", response)

                localStorage.setItem("creds", JSON.stringify(creds))
                toast.success("Profile fetched successfully")
                return true;
            }
            toast.error("Unable to fetch profile")
            return false;
        } catch (err) {
            console.error("Profile fetch failed:", err);
        }
    },


    // logout: async () => {
    //     set({ user: null, isAuthenticated: false });
    // },
}));