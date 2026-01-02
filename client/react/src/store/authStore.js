import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    user: null,
    authLoading: false,
    isAuthenticated: false,
    error: null,
    projects: [],
    task:[],

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

    getProjects: async () => {
        try {
            // apiSecret
            const [{ apiKey }, {apiSecret}] = JSON.parse(localStorage.getItem("creds"));
            
            console.log(apiKey, apiSecret)

            const res = await axiosInstance.get(
                "/api/method/frappetrack.api.project.get_projects_list",
                {
                    headers: {
                        'Authorization': `token ${apiKey}:${apiSecret}`,
                    },
                }
            );

            const data = res.data;
            console.log("Project response:", data);

            if (data?.message?.status) {
                set({ projects: data.message.data });
                toast.success("Projects fetched successfully")
                return true;
            }
            toast.error("Unable to fetch projects")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },
    getTask: async (project_id) => {
        console.log("hitting get_task")
        try {
            // apiSecret
            const [{ apiKey }, {apiSecret}] = JSON.parse(localStorage.getItem("creds"));
            
            console.log(apiKey, apiSecret)

            const res = await axiosInstance.get(
                `api/method/frappetrack.api.task.get_task_by_project?project_id=${project_id}`,
                {
                    headers: {
                        'Authorization': `token ${apiKey}:${apiSecret}`,
                    },
                }
            );

            const data = res.data;
            console.log("Task response:", data);

            if (data?.message?.status) {
                set({ task: data.message.data });
                toast.success("Task fetched successfully")
                return true;
            }
            toast.error("Unable to fetch tasks")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },
    // logout: async () => {
    //     set({ user: null, isAuthenticated: false });
    // },
}));