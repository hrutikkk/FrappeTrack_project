import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore"

const Tracker = () => {
    const [seconds, setSeconds] = useState(0);
    const [screenshots, setScreenshots] = useState([]);

    const { getProjects, getTask, getTimeSheetList, projects, task, timeSheet } = useAuthStore()
    const [selectedProject, setSelectedProject] = useState(null);
    const [taskByProject, setTaskByProject] = useState(null)
    const [timeSheetValue, setTimeSheetValue] = useState(null)

    useEffect(() => {
        getProjects()
    }, [])


    console.log(projects)
    console.log(task)
    async function handleProjectChange(e) {
        const value = e.target.value;
        console.log(value);

        await getTask(value)

    }
    async function handleTaskByProject(e) {
        const value = e.target.value;
        console.log(value);

        await getTimeSheetList(value)

    }
    async function handleTimeSheet(e) {
        const value = e.target.value;
        console.log(value);

        // await getTimeSheetList(value)

    }

    const timerIntervalRef = useRef(null);
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
        const min = 1 * 60 * 1000;   // 3 min
        const max = 2 * 60 * 1000;  // 10 min
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

        if (imgData) {
            setScreenshots((prev) => [...prev, imgData]);
            imageIndexRef.current += 1;
        }
    };

    // ----------- SCREENSHOT LOOP ------------
    const scheduleScreenshot = () => {
        const delay = getRandomDelay();

        screenshotTimeoutRef.current = setTimeout(async () => {
            await captureScreenshot();
            scheduleScreenshot(); // schedule next
        }, delay);
    };

    // ------------ BUTTONS ------------------
    const handleStart = () => {
        console.log("Start clicked");

        if (!timerIntervalRef.current) {
            timerIntervalRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);

            scheduleScreenshot();
        }
    };

    const handlePause = () => {
        clearInterval(timerIntervalRef.current);
        clearTimeout(screenshotTimeoutRef.current);

        timerIntervalRef.current = null;
        screenshotTimeoutRef.current = null;
    };

    const handleStop = () => {
        handlePause();
        setSeconds(0);
        setScreenshots([]);
        sessionIdRef.current += 1;
        imageIndexRef.current = 1;
    };

    // ------------- CLEANUP -----------------
    useEffect(() => {
        return () => {
            clearInterval(timerIntervalRef.current);
            clearTimeout(screenshotTimeoutRef.current);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center px-4">

            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-xl p-6 md:p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome</h2>
                    <h2 id="username" className="text-xl text-gray-500 mt-1"></h2>
                </div>

                {/* Controls */}
                <div className="mb-8">

                    {/* Selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <select
                            value={selectedProject}
                            onChange={handleProjectChange}
                            className="h-11 rounded-xl border border-gray-300 px-4 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                            className="h-11 rounded-xl border border-gray-300 px-4 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                            className="h-11 rounded-xl border border-gray-300 px-4 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="">Select timesheet</option>
                            {timeSheet.map(tsheet => (
                                <option key={tsheet.name} value={tsheet.name}>
                                    {tsheet.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-6 mb-6">
                        <button
                            onClick={handleStart}
                            className="w-20 h-20 rounded-full bg-green-200 border font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition">
                            Start
                        </button>

                        <button
                            onClick={handlePause}
                            className="w-20 h-20 rounded-full bg-yellow-200 border font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition">
                            Pause
                        </button>

                        <button
                            onClick={handleStop}
                            className="w-20 h-20 rounded-full bg-red-200 border font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition">
                            Stop
                        </button>
                    </div>

                    {/* Timer */}
                    <div className="bg-gray-100 rounded-2xl p-6 text-4xl text-center font-mono shadow-inner">
                        {formatTime(seconds)}
                    </div>
                </div>

                {/* Screenshot Preview */}
                <div>
                    <h4 className="text-gray-700 font-semibold mb-4">
                        Screenshot Preview
                    </h4>

                    {screenshots.length === 0 ? (
                        <div className="text-gray-400 text-center py-10 border-2  rounded-xl">
                            Screenshots will appear here
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {screenshots.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt="screenshot"
                                    className="rounded-xl shadow-md hover:scale-105 transition"
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>

    );
};

export default Tracker;
