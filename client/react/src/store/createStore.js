import { create } from "zustand";
import axiosInstance from '../api/axiosInstance'
import { useTimerStore } from "./timerStore";
/*
   const [selectedProject, setSelectedProject] = useState(null);
    const [taskByProject, setTaskByProject] = useState(null)
    const [timeSheetValue, setTimeSheetValue] = useState(null)
*/
export const useCreateStore = create((set, get) => ({

    projects: [],
    task: [],
    timeSheet: [],
    descriptionStore: null,
    selectedProject: null,
    taskByProject: null,
    timeSheetValue: null,

    setSelectedProject: (selectedProject) => set({ selectedProject }),
    setTaskByProject: (taskByProject) => set({ taskByProject }),
    setTimeSheetValue: (timeSheetValue) => set({ timeSheetValue }),

    setDescriptionStore: (descriptionStore) => {
        console.log(descriptionStore)
        console.log(get().descriptionStore)
        set({ descriptionStore })
    },

    createTimesheet: async (timesheetData) => {
        try {
            // apiSecret
            const [{ apiKey }, { apiSecret }] = JSON.parse(localStorage.getItem("creds"));

            console.log(apiKey, apiSecret)

            const res = await axiosInstance.post(
                "/api/method/frappetrack.api.timesheet.create_timesheet", timesheetData,
                {
                    headers: {
                        'Authorization': `token ${apiKey}:${apiSecret}`,
                    },
                }
            );

            const data = res.data;
            console.log("Project response:", data);

            // if (data?.message?.status) {
            //     set({ projects: data.message.data });
            //     // toast.success("Projects fetched successfully")
            //     return true;
            set({ setDescriptionStore: null, setSelectedProject: null, setTaskByProject: null, setTimeSheetValue: null })
            // }

            toast.error("Unable to fetch projects")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },
    getProjects: async () => {
        try {
            // apiSecret
            const [{ apiKey }, { apiSecret }] = JSON.parse(localStorage.getItem("creds"));

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
                // toast.success("Projects fetched successfully")
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
            const [{ apiKey }, { apiSecret }] = JSON.parse(localStorage.getItem("creds"));

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
                // toast.success("Task fetched successfully")
                return true;
            }
            toast.error("Unable to fetch tasks")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },
    getTimeSheetList: async (task_id) => {
        console.log("hitting timesheet")
        try {
            // apiSecret
            const [{ apiKey }, { apiSecret }] = JSON.parse(localStorage.getItem("creds"));

            console.log(apiKey, apiSecret)

            const res = await axiosInstance.get(
                `api/method/frappetrack.api.timesheet.get_timesheet_by_task?task_id=${task_id}`,
                {
                    headers: {
                        'Authorization': `token ${apiKey}:${apiSecret}`,
                    },
                }
            );

            const data = res.data;
            console.log("Timesheet response:", data);

            if (data?.message?.status) {
                set({ timeSheet: data.message.data });
                // toast.success("Time fetched successfully")
                return true;
            }
            toast.error("Unable to fetch tasks")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },

    stopHandler: async (data) => {
        try {
            const [{ apiKey }, { apiSecret }] = JSON.parse(localStorage.getItem("creds"));

            const jsonData = JSON.parse(JSON.stringify(data));  // if (data?.message?.status) {

            const now = new Date();

            const formattedTime = now
                .toLocaleString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hourCycle: 'h23'
                })
                .replace(/\//g, '-')                         // 06-01-2026, 03:56:36
                .replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1') // 2026-01-06, 03:56:36
                .replace(', ', ' ');                         // remove comma
            useTimerStore.setState({ endTime: formattedTime })
            jsonData.time_log.to_time = formattedTime

            console.log("timesheet data", jsonData)


            const res = await axiosInstance.post("/api/method/frappetrack.api.timesheet.add_time_log", jsonData,
                {
                    headers: {
                        'Authorization': `token ${apiKey}:${apiSecret}`,
                    },
                }
            )
            console.log("response from timesheet", res)
            set({ descriptionStore: null, selectedProject: null, taskByProject: null, timeSheetValue: null })
            return true;
        } catch (error) {
            console.log(
                "Error while stopping",
                error
            )
            return null
        }
    }
}))
