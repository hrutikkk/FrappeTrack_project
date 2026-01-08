import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useTimerStore } from "../store/timerStore";
import { useScreenshotStore } from "../store/screenshotStore"
import { toast } from 'react-hot-toast'
import { useCreateStore } from "../store/createStore";

const Tracker = () => {
    const {
        remainingDelay,
        nextShotAt,
        setSchedule,
        clearSchedule,
        screenshots,
        addScreenshot,
        clearScreenshots,
        send_screenshot
    } = useScreenshotStore();
    const { createTimeSheet, timeSheet, stopHandler, getProjects, getTask, getTimeSheetList, projects, task, } = useCreateStore()
    const { startTime, endTime, isRunning } = useTimerStore()
    const { user } = useAuthStore()
    const [selectedProject, setSelectedProject] = useState(null);
    const [taskByProject, setTaskByProject] = useState(null)
    const [timeSheetValue, setTimeSheetValue] = useState(null)
    const [description, setDescription] = useState(null)
    const [isTimeSheet, setIsTimeSheet] = useState(false)

    const allSelected = selectedProject && taskByProject && timeSheetValue;

    useEffect(() => {
        getProjects()
        console.log("user: ", user);
        console.log("project", selectedProject);
    }, [])

    console.log("screenshots: ", screenshots)

    console.log(projects)
    console.log(task)
    async function handleProjectChange(e) {
        const value = e.target.value;
        setSelectedProject(value);
        console.log(value);

        await getTask(value)

    }
    async function handleTaskByProject(e) {
        const value = e.target.value;
        setTaskByProject(value)
        console.log(value);

        await getTimeSheetList(value)

    }
    async function handleTimeSheet(e) {
        const value = e.target.value;
        setTimeSheetValue(value)
        setIsTimeSheet(true)
        if (value !== "create-timesheet") {
            console.log("changing isTimesheet")
            setIsTimeSheet(false)
        }
        console.log("timesheet value: ", value);
        // await getTimeSheetList(value)

    }


    const screenshotTimeoutRef = useRef(null);

    const sessionIdRef = useRef(1);
    const imageIndexRef = useRef(1);

    // ---------------- TIMER ----------------
    const formatTime = (secs) => {
        const h = String(Math.floor(secs / 3600)).padStart(2, "0");
        const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    // ------------- RANDOM INTERVAL ----------
    const getRandomDelay = () => {
        const min = 0.5 * 60 * 1000;   // 3 min
        const max = 1 * 60 * 1000;  // 10 min
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // ------------ CAPTURE -------------------
    const captureScreenshot = async () => {
        if (!window.electronAPI?.captureScreen) {
            console.error("Electron API not available!");
            return;
        }

        const imgData = await window.electronAPI.captureScreen({
            sessionId: sessionIdRef.current,
            imageIndex: imageIndexRef.current,
        });

        console.log("imgdata", imgData)
        if (imgData.thumbnail) {
            const validStr = imgData.thumbnail.split(",")[1];
            console.log(validStr);
            let data = {
                "file_name": imgData.screenshotTime,
                "file_data": validStr,
                "timesheet_id": timeSheetValue
            }
            const res = await send_screenshot(data);
            if (!res) {
                return toast.error("error while sending screeenshot");
            }
            console.log(res);
            addScreenshot(imgData.thumbnail, imgData.screenshotTime);
            imageIndexRef.current += 1;
        }
    };

    // ----------- SCREENSHOT LOOP ------------
    const scheduleScreenshot = (delayOverride = null) => {
        if (screenshotTimeoutRef.current) return;

        const delay = delayOverride ?? getRandomDelay();

        setSchedule(delay);

        console.log("Next screenshot in", delay / 1000, "seconds");

        screenshotTimeoutRef.current = setTimeout(async () => {
            screenshotTimeoutRef.current = null;
            clearSchedule();

            console.log("Taking screenshot now");
            await captureScreenshot();

            scheduleScreenshot(); // new random delay AFTER capture
        }, delay);
    };

    //missing dropdown
    const getMissingSelections = () => {
        const missing = [];

        if (!selectedProject) missing.push("project");
        if (!taskByProject) missing.push("task");
        if (!timeSheetValue) missing.push("timesheet");

        return missing;
    };

    // ------------ BUTTONS ------------------
    const { seconds, start, pause, reset } = useTimerStore();

    const handleStart = () => {
        console.log("Start clicked");

        const missing = getMissingSelections();

        if (missing.length > 0) {
            toast.error(`Please select ${missing.join(" and ")}`);
            return;
        }
        start();


        if (!screenshotTimeoutRef.current) {
            if (remainingDelay != null) {
                scheduleScreenshot(remainingDelay);
            } else {
                scheduleScreenshot();
            }
        }
    };

    const handlePause = () => {
        pause();

        if (nextShotAt) {
            const remaining = Math.max(nextShotAt - Date.now(), 0);
            setSchedule(remaining);
        }

        clearTimeout(screenshotTimeoutRef.current);
        screenshotTimeoutRef.current = null;
    };

    const handleStop = async () => {

        // activity type
        const taskObj = task.filter(t => t.name == taskByProject)
        console.log("taskobject", taskObj, taskObj[0].subject, task[0]["subject"])

        // screenshots into a string format - 
        // const reader = new FileReader();
        // reader.onload = function () {
        //     screenshots.map()
        // }
        const data = {
            "timesheet": timeSheet,
            "employee": user.employee.name,
            "time_log": {
                "activity_type": taskObj[0].subject,
                // "activity_type": "Coding",
                "from_time": startTime,
                "to_time": endTime,
                "hours": "54",
                "project": selectedProject,
                "task": taskByProject,
                "description": description,
                "screenshots": screenshots
            }
        };
        const res = await stopHandler(data)
        if (!res) toast.error("Unable to send the screenshots")
        console.log("screenshots", screenshots)
        const missing = getMissingSelections();

        if (missing.length > 0) {
            toast.error(`Please select ${missing.join(" and ")}`);
            return;
        }
        // pause();
        reset(); // ✅ logs end time + duration inside store

        clearTimeout(screenshotTimeoutRef.current);
        screenshotTimeoutRef.current = null;

        clearSchedule();
        clearScreenshots();

        sessionIdRef.current += 1;
        imageIndexRef.current = 1;
    }
    // ------------- CLEANUP -----------------
    useEffect(() => {
        return () => {
            clearTimeout(screenshotTimeoutRef.current);
        };
    }, []);

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center px-4 py-10">

            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-[0_10px_40px_rgba(59,130,246,0.15)] p-6 md:p-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">Welcome</h2>
                    <h2 id="username" className="text-base text-slate-500 mt-1"></h2>
                </div>

                {/* Controls */}
                <div className="mb-8">

                    {/* Selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <select
                            value={selectedProject}
                            onChange={handleProjectChange}
                            className="h-11 rounded-lg border border-slate-300 px-4 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 transition"
                        >
                            <option value="">Select project</option>
                            {projects.map(project => (
                                <option key={project.name} value={project.name}>
                                    {project.project_name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={taskByProject}
                            onChange={handleTaskByProject}
                            className="h-11 rounded-lg border border-slate-300 px-4 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 transition"
                        >
                            <option value="">Select task</option>
                            {task.map(t => (
                                <option key={t.name} value={t.name}>
                                    {t.subject}
                                </option>
                            ))}
                        </select>

                        <select
                            value={timeSheetValue}
                            onChange={handleTimeSheet}
                            className="h-11 rounded-lg border border-slate-300 px-4 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 transition"
                        >
                            <option value="">Select timesheet</option>
                            <option value="create-timesheet">Create timesheet</option>
                            {timeSheet.map(tsheet => (
                                <option key={tsheet.name} value={tsheet.name}>
                                    {tsheet.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Task Description */}
                    <div className="mb-6">
                        <label className="block text-slate-700 font-medium mb-2" htmlFor="taskDescription">
                            Task Description
                        </label>
                        <textarea
                            id="taskDescription"
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what you worked on..."
                            className="w-full min-h-[110px] p-4 rounded-xl border border-slate-300
          bg-slate-50 text-sm text-slate-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          resize-none transition"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-6 mb-8">

                        {!isTimeSheet ? (

                            <>
                                {!isRunning ?
                                    (
                                        // start
                                        <button
                                            onClick={handleStart}
                                            title="Start"
                                            className="w-full p-2 rounded-lg bg-blue-600
        flex items-center justify-center
        shadow hover:bg-blue-700 active:scale-95 transition text-white"
                                        >
                                            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                                <polygon points="5,3 19,12 5,21" />
                                            </svg>
                                            Start Timer
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStop}
                                            title="Stop"
                                            className="w-full p-2 rounded-lg bg-slate-600
        flex items-center justify-center
        shadow hover:bg-slate-700 active:scale-95 transition text-white"
                                        >
                                            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                                <rect x="5" y="5" width="14" height="14" />
                                            </svg>
                                            Stop Timer
                                        </button>
                                    )

                                }

                                {/* Pause */}
                                {/* <button
                                    onClick={handlePause}
                                    title="Pause"
                                    className="w-14 h-14 rounded-lg bg-sky-500
        flex items-center justify-center
        shadow hover:bg-sky-600 active:scale-95 transition"
                                >
                                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                </button> */}

                                {/* Stop */}


                            </>
                        ) : (
                            <>
                                <button
                                    className="bg-black
      rounded-xl p-2 text-xl text-center font-mono text-white
      tracking-widest shadow-inner w-full"
                                    onClick={() => createTimeSheet({ "employee": user.employee.name, "parent_project": selectedProject, "time_logs": [] })}
                                >
                                    Create
                                </button>
                            </>
                        )

                        }
                    </div>


                    {/* Timer */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600
      rounded-xl p-6 text-4xl text-center font-mono text-white
      tracking-widest shadow-inner">
                        {formatTime(seconds)}
                    </div>
                </div>

                {/* Screenshot Preview */}
                <div>
                    <h4 className="text-slate-700 font-semibold mb-4 mt-10">Screenshot Preview</h4>

                    {screenshots.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-center py-10">
                            Screenshots will appear here
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {screenshots.map((src, index) => (
                                <img
                                    key={index}
                                    src={src.screenshot}
                                    alt="screenshot"
                                    className="rounded-lg shadow hover:shadow-lg hover:scale-105 transition"
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>


    );
};

export default Tracker
