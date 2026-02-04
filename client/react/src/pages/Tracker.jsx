// React hooks
import { act, useEffect, useRef, useState } from "react";

// Zustand stores
import { useAuthStore } from "../store/authStore";
import { useTimerStore } from "../store/timerStore";
import { useScreenshotStore } from "../store/screenshotStore";
import { useCreateStore } from "../store/createStore";

// Toast notifications
import { toast } from "react-hot-toast";

const Tracker = () => {

  /* ---------------- SCREENSHOT STORE ---------------- */
  const {
    remainingDelay,     // remaining time before next screenshot
    nextShotAt,         // timestamp for next screenshot
    setSchedule,        // schedule screenshots
    clearSchedule,      // clear screenshot schedule
    screenshots,        // captured screenshots array
    addScreenshot,      // add screenshot to store
    clearScreenshots,   // clear screenshot list
    send_screenshot,    // send screenshot to backend
    startScreenshots,   // start taking screenshots
    pauseScreenshots,   // pause screenshots
    stopScreenshots,    // stop screenshots
  } = useScreenshotStore();

  /* ---------------- CREATE / TIMESHEET STORE ---------------- */
  const {
    selectedProject,
    setSelectedProject,
    timeSheetValue,
    setTimeSheetValue,
    taskByProject,
    setTaskByProject,
    descriptionStore,
    setDescriptionStore,
    createTimesheet,
    timeSheet,
    stopHandler,
    getProjects,
    getTask,
    getTimeSheetList,
    projects,
    task,
    setActivityType,

    activity,
    activityType,
    getActivityType,
    createTask
  } = useCreateStore();

  /* ---------------- TIMER STORE ---------------- */
  const {
    startTime,
    endTime,
    isRunning,
    seconds,
    start,
    pause,
    reset,
    totalSessionTime
  } = useTimerStore();

  /* ---------------- AUTH STORE ---------------- */
  const { user } = useAuthStore();

  /* ---------------- LOCAL UI STATES ---------------- */
  const [isTimeSheet, setIsTimeSheet] = useState(false); // toggles timesheet creation mode
  const [timerState, setTimerState] = useState("stopped"); // stopped | running | paused
  const [creatingTask, setCreatingTask] = useState(false); // toggles task creation mode
  const [taskSubject, setTaskSubject] = useState(""); // task subject text
  const [selectedPriority, setSelectedPriority] = useState(""); // task priority

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    // Fetch projects when component mounts
    getProjects();
  }, []);

  /* ---------------- HANDLERS ---------------- */

  // Handle project selection
  async function handleProjectChange(e) {
    const value = e.target.value;
    setSelectedProject(value);
    await getTask(value); // fetch tasks for selected project
  }

  // Handle task selection or create-task option
  async function handleTaskByProject(e) {
    const value = e.target.value;

    if (value === "create-task") {
      setTaskByProject(value)
      setCreatingTask(true); // switch UI to task creation mode
      return;
    }

    setCreatingTask(false);
    setTaskByProject(value);
    setSelectedPriority("")

    await getActivityType();      // fetch activity types
    await getTimeSheetList(value); // fetch timesheets for task
  }

  // Handle activity type selection
  async function handleSetActivityType(e) {
    setActivityType(e.target.value);
  }

  // Handle timesheet selection
  async function handleTimeSheet(e) {
    const value = e.target.value;
    setTimeSheetValue(value);
    setIsTimeSheet(value === "create-timesheet");
  }

  // Handle task priority selection
  const handleSetPriority = (e) => {
    setSelectedPriority(e.target.value);
  };

  // Handle textarea input (task subject or description)
  const handleText = (val) => {
    if (creatingTask) setTaskSubject(val);
    else setDescriptionStore(val);
  };

  /* ---------------- TIMER HELPERS ---------------- */

  // Convert seconds to HH:MM:SS format
  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Delete screenshot folder from system
  const delScreenshotFolder = async () => {
    try {
      await window.electronAPI.deleteScreenshots();
    } catch (error) {
      console.log("Unable to delete screenshot folder", error);
    }
  };

  // Check for missing required dropdown selections
  const getMissingSelections = () => {
    const missing = [];
    if (!selectedProject) missing.push("project");
    if (!taskByProject) missing.push("task");
    if (!activityType) missing.push("activity");
    if (!timeSheetValue) missing.push("timesheet");
    return missing;
  };

  /* ---------------- CREATE TIMESHEET ---------------- */
  async function createTimeSheetHandler() {
    const missing = getMissingSelections();
    if (missing.length) {
      toast.error(`Please select ${missing.join(" and ")}`);
      return;
    }

    if (!descriptionStore) {
      toast.error("Please write description");
      return;
    }

    await createTimesheet(
      user?.employee?.name,
      selectedProject,
      activityType,
      taskByProject,
      descriptionStore
    );

    // Reset selections
    setSelectedProject("");
    setTaskByProject("");
    setActivityType("");
    setDescriptionStore("");
    setTimeSheetValue(null);
  }

  /* ---------------- CREATE TASK ---------------- */
  const createTaskHandler = async () => {
    const missing = [];
    if (!selectedProject) missing.push("project");
    if (!selectedPriority) missing.push("priority");
    if (missing.length) {
      toast.error(`Please select ${missing.join(" and ")}`);
      return;
    }
    if (!taskSubject) {
      toast.error("Please write subject")
      return
    }

    await createTask(selectedProject, taskSubject, selectedPriority);

    // Reset task form
    setTaskSubject("");
    setSelectedPriority("");
    setSelectedProject("");
    setDescriptionStore("");
    setCreatingTask(false);
  };

  /* ---------------- TIMER CONTROLS ---------------- */

  // Start timer and screenshots
  const handleStart = () => {
    const missing = getMissingSelections();
    if (missing.length) {
      toast.error(`Please select ${missing.join(" and ")}`);
      return false;
    }

    if (!descriptionStore) {
      toast.error("Please write description");
      return false;
    }

    window.electronAPI.setTimerStatus(true);
    start(); // start timer
    startScreenshots(timeSheetValue); // start screenshots
    return true;
  };

  // Pause timer and screenshots
  const handlePause = () => {
    pause();
    pauseScreenshots();
  };

  // Stop timer, send data, cleanup
  const handleStop = async () => {
    window.electronAPI.setTimerStatus(false);

    if (isRunning) pause();
    reset(); // calculate final session time
    stopScreenshots();

    const sessionTime = useTimerStore.getState().totalSessionTime;
    const hours = (sessionTime / (1000 * 60 * 60)).toFixed(6);

    const data = {
      timesheet: timeSheetValue,
      employee: user.employee.name,
      time_log: {
        activity_type: activityType,
        from_time: startTime,
        to_time: endTime,
        hours,
        project: selectedProject,
        task: taskByProject,
        description: descriptionStore,
        screenshots,
      },
    };

    const res = await stopHandler(data);
    if (!res) toast.error("Unable to send the screenshots");

    delScreenshotFolder();

    // Reset UI state
    setSelectedProject("");
    setTaskByProject("");
    setTimeSheetValue("");
    setDescriptionStore("");
    setActivityType("");
    setIsTimeSheet(false);
  };

  /* ---------------- TIMER BUTTONS ---------------- */
  const timerButtons = () => {
    switch (timerState) {
      case "stopped":
        return [{
          label: "Start Timer",
          onClick: () => handleStart() && setTimerState("running"),
          bg: "bg-blue-600",
          hover: "hover:bg-blue-700",
          icon: <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
        }];

      case "running":
        return [
          {
            label: "Stop",
            onClick: () => { setTimerState("stopped"); handleStop(); },
            bg: "bg-slate-600",
            hover: "hover:bg-slate-700",
            icon: <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" /></svg>
          },
          {
            label: "Pause",
            onClick: () => { setTimerState("paused"); handlePause(); },
            bg: "bg-sky-500",
            hover: "hover:bg-sky-600",
            icon: <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          }
        ];

      case "paused":
        return [
          {
            label: "Stop",
            onClick: () => { setTimerState("stopped"); handleStop(); },
            bg: "bg-slate-600",
            hover: "hover:bg-slate-700",
            icon: <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" /></svg>
          },
          {
            label: "Resume",
            onClick: () => { setTimerState("running"); handleStart(); },
            bg: "bg-green-600",
            hover: "hover:bg-green-700",
            icon: <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
          }
        ];
      default:
        return [];
    }
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-[0_10px_40px_rgba(59,130,246,0.15)] p-6 md:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">
            Welcome {user.name}
          </h2>
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
              {projects.map((project) => (
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
              {selectedProject && (
                <option value="create-task">Create Task</option>
              )}
              {task.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.subject}
                </option>
              ))}
            </select>


            {creatingTask ? <select
              value={selectedPriority}
              onChange={handleSetPriority}
              className="h-11 rounded-lg border border-slate-300 px-4 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 transition"
            >
              <option value="">Select Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>

            </select>
              :
              <select
                value={activityType}
                onChange={handleSetActivityType}
                className="h-11 rounded-lg border border-slate-300 px-4 text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 transition"
              >
                <option value="">Select Activity</option>
                {activity.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            }

            {/* Timesheet dropdown shows only if a normal task is selected */}
            {!creatingTask && taskByProject && (
              <select
                value={timeSheetValue}
                onChange={handleTimeSheet}
                className="h-11 rounded-lg border border-slate-300 px-4 text-sm bg-white
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      hover:border-blue-400 transition"
              >
                <option value="">Select timesheet</option>
                {selectedProject && taskByProject && (
                  <option value="create-timesheet">Create timesheet</option>
                )}
                {timeSheet.map((tsheet) => (
                  <option key={tsheet.name} value={tsheet.name}>
                    {tsheet.name}
                  </option>
                ))}
              </select>
            )}

          </div>

          {/* Task / Subject Description */}
          <div className="mb-6">
            <label
              className="block text-slate-700 font-medium mb-2"
              htmlFor="taskDescription"
            >
              {creatingTask ? "Subject Description" : "Task Description"}
            </label>
            <textarea
              id="taskDescription"
              onChange={(e) => handleText(e.target.value)}
              value={creatingTask ? taskSubject : descriptionStore}
              placeholder={
                creatingTask
                  ? "Briefly describe the task subject..."
                  : "Briefly describe what you worked on..."
              }
              className="w-full min-h-[110px] p-4 rounded-xl border border-slate-300
      bg-slate-50 text-sm text-slate-700
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      resize-none transition"
            />
          </div>


          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mb-8">
            {!creatingTask && !isTimeSheet ? (
              <div className={`flex gap-4 w-full`}>
                {timerButtons().map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={btn.onClick}
                    title={btn.label}
                    className={`flex-1 p-2 rounded-lg ${btn.bg} flex items-center justify-center shadow ${btn.hover} active:scale-95 transition text-white cursor-pointer`}
                  >
                    {btn.icon}
                    <span className="ml-2">{btn.label}</span>
                  </button>
                ))}
              </div>
            ) : creatingTask ? (
              <button
                className="bg-black rounded-xl p-2 text-xl text-center font-mono text-white tracking-widest shadow-inner w-full cursor-pointer"
                onClick={createTaskHandler}
              >
                Create Task
              </button>
            ) : (
              <button
                className="bg-black rounded-xl p-2 text-xl text-center font-mono text-white tracking-widest shadow-inner w-full cursor-pointer"
                onClick={createTimeSheetHandler}
              >
                Create Timesheet
              </button>
            )}
          </div>





          {/* Timer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600
      rounded-xl p-6 text-4xl text-center font-mono text-white
      tracking-widest shadow-inner"
          >
            {formatTime(seconds)}
          </div>
        </div>

        {/* Screenshot Preview */}
        <div>
          <h4 className="text-slate-700 font-semibold mb-4 mt-10">
            Screenshot Preview
          </h4>

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

export default Tracker;
