import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore"

const Tracker = () => {
  const [seconds, setSeconds] = useState(0);
  const [screenshots, setScreenshots] = useState([]);

    const { getProjects, getTask, projects, task } = useAuthStore()
    const [selectedProject, setSelectedProject] = useState(null)
    
    useEffect(()=>{
        getProjects()
    },[])

   
    console.log(projects)
    console.log(task)
    async function handleProjectChange(e) {
        const value = e.target.value;
        console.log(value);

        await getTask(value)

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
    const min = 3 * 60 * 1000;   // 3 min
    const max = 10 * 60 * 1000;  // 10 min
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
        <div className=" bg-gray-100 flex items-center justify-center min-h-screen">

            <div className="bg-white p-5 w-full max-w-md rounded-2xl shadow-lg">

                <div className="text-center mb-5">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
                    <h2 id="username" className="text-2xl font-bold text-gray-800"></h2>
                </div>

                <div className="flex gap-2 mb-5">
                    <select
                    value={selectedProject}
                    onChange={handleProjectChange}
                        className="flex-1 h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white shadow-sm focus:outline-none focus:border-gray-600">
                        
                        <option value="">Select project</option>
                        {projects.map((project) => (
                             <option key={project.name} value={project.name}>{project.project_name}</option>
                        ))}

                    </select>

                    <select
                        className="flex-1 h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white shadow-sm focus:outline-none focus:border-gray-600">
                        <option value="">Select project</option>
                        {task.map((t) => {
                            return <option key={t.name} value={t.name}>{t.subject}</option>
                        })}
                    </select>

                    <select
                        className="flex-1 h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white shadow-sm focus:outline-none focus:border-gray-600">
                        <option value="">Timesheet</option>
                        <option value="">Create timesheet</option>
                    </select>
                </div>

                <div className="flex justify-around gap-3 mb-5">
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

                <div className="mb-5 bg-white p-4 text-3xl text-center rounded-xl shadow-inner font-mono">
                  {formatTime(seconds)}
                </div>

                <h4 className="text-gray-700 font-medium mb-2">Screenshot Preview</h4>

                <div className="flex flex-wrap gap-2">
                  {screenshots.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt="screenshot"
                      className="w-[120px] rounded-lg shadow-md"
                    />
                  ))}
                </div>

            </div>
        </div>
  );
};

export default Tracker;
