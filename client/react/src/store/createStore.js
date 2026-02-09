import { create } from "zustand";
import axiosInstance from '../api/axiosInstance'
import { useTimerStore } from "./timerStore";
import toast from "react-hot-toast";
/*
   const [selectedProject, setSelectedProject] = useState(null);
    const [taskByProject, setTaskByProject] = useState(null)
    const [timeSheetValue, setTimeSheetValue] = useState(null)
*/
export const useCreateStore = create((set, get) => ({

    projects: [],
    task: [],
    activity: [],
    timeSheet: [],
    descriptionStore: null,
    selectedProject: null,
    taskByProject: null,
    timeSheetValue: null,
    activityType: null,

    setActivityType: (activityType) => set({ activityType }),
    setSelectedProject: (selectedProject) => set({ selectedProject }),
    setTaskByProject: (taskByProject) => set({ taskByProject }),
    setTimeSheetValue: (timeSheetValue) => set({ timeSheetValue }),
    setDescriptionStore: (descriptionStore) => {
        set({ descriptionStore })
    },

    createTimesheet: async (employee, parent_project, activity_type, taskByProject, descriptionStore) => {
        try {

            const res = await axiosInstance.post(
                "/method/frappetrack.api.timesheet.create_timesheet", { employee, parent_project, activity_type, taskByProject, descriptionStore }
            );

            const data = res.data?.message;


            if (data?.status) {
                toast.success("TimeSheet created successfully")
                set({
                    descriptionStore: null,
                    selectedProject: null,
                    taskByProject: null,
                    timeSheetValue: null,
                    activityType: null
                })
                return true;
            }


            toast.error("Unable create Timesheet")
            return false
        } catch (err) {
            console.error("Timesheet creation failed:", err);
            toast.error("Server error while creating timesheet");
            return false;
        }
    },
    createTask:async(project,subject,priority)=>{
        try {
            const res = await axiosInstance.post("/method/frappetrack.api.task.create_task",{project,subject,priority})
            if(res?.data?.message?.status){
                toast.success("Task created successfully!");
                set({descriptionStore:null})
                return true;
            }
            toast.error("Unable to create task")
            
            
        } catch (error) {
            console.log("create task error",error)
            toast.error("Server error while creating task");
            
        }

    },

    getProjects: async () => {
        try {
            /*
                fetching Projects list:
                when user gets authenticated this function gets called and store the project list
            */
            const res = await axiosInstance.get(
                "/method/frappetrack.api.project.get_projects_list"
            );

            const data = res.data;


            if (data?.message?.status) {
                set({ projects: data.message.data });
                return true;
            }
            toast.error("Unable to fetch projects")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },

    getTask: async (project_id) => {
        /*
            fetching Tasks list:
            when projects gets fetch this function gets called and store the task list
        */
        console.log("hitting get_task")
        try {

            const res = await axiosInstance.get(
                `/method/frappetrack.api.task.get_task_by_project?project_id=${project_id}`,
            );

            const data = res.data;


            if (data?.message?.status) {
                set({ task: data.message.data });
                return true;
            }
            toast.error("Unable to fetch tasks")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },
    getActivityType: async (task_id) => {
        /*
            fetching Activity list:
            when Tasks gets fetch this function gets called and store the activity list
        */
        console.log("hitting timesheet")
        try {

            const res = await axiosInstance.get(
                `/method/frappetrack.api.activity_type_api.get_activity_type`
            );

            const data = res.data;


            if (data?.message?.status) {
                set({ activity: data.message.data });
                return true;
            }
            toast.error("Unable to fetch tasks")
            return false
        } catch (err) {
            console.error("Projects fetch failed:", err);
        }
    },
    getTimeSheetList: async (task_id) => {
        /*
            fetching Tasks list:
            when task gets fetch this function gets called and store the timesheet list
        */

        try {

            const res = await axiosInstance.get(
                `/method/frappetrack.api.timesheet.get_timesheet_by_task?task_id=${task_id}`
            );

            const data = res.data;


            if (data?.message?.status) {
                set({ timeSheet: data.message.data });
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
            /*
                Stopping the timer:
                this function sends the detail of which Project, Task, Activity, Timesheet to backend
            */
            const jsonData = JSON.parse(JSON.stringify(data));
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




            const res = await axiosInstance.post("/method/frappetrack.api.timesheet.add_time_log", jsonData
            )

            set({ descriptionStore: null, selectedProject: null, taskByProject: null, timeSheetValue: null })
            toast.success("Log added sucessfully")
            return true;
        } catch (error) {
            console.log(
                "Error while stopping",
                error
            )
            return null
        }
    },
}))
