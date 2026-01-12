// // store/timerStore.js
// import { create } from "zustand";

// export const useTimerStore = create((set, get) => ({
//   seconds: 0,
//   isRunning: false,
//   intervalId: null,
  
//   startTime: null,
//   endTime: null,
//   totalTime: null,
//   startTimeSec: null,
//   pauseFlag: false,
//   pauseStartTime: null,
//   pauseEndTime: null,


//   start: () => {
//     if (get().intervalId) return;
//     console.log("intervalId in start", get().intervalId)

//     // ✅ set startTime only once
//     if (!get().startTime) {
//       const now = new Date();

//       const formattedTime = now
//         .toLocaleString('en-GB', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit',
//           hourCycle: 'h23'
//         })
//         .replace(/\//g, '-')                         // 06-01-2026, 03:56:36
//         .replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1') // 2026-01-06, 03:56:36
//         .replace(', ', ' ');                         // remove comma
//       console.log("⏱️ Session started at:", formattedTime);
//       set({ startTime: formattedTime, startTimeSec: now.getTime() });
//     }

//     const id = setInterval(() => {
//       set((state) => ({ seconds: state.seconds + 1 }));
//     }, 1000);

//     set({ intervalId: id, isRunning: true });
//   },

//   pause: () => {
//     const { pauseFlag, startTime, startTimeSec } = get()
//     if (!pauseFlag) {
//       const pst = new Date()
//       set({ pauseStartTime: pst, pauseFlag: true })
//     }
//     // console.log("intervalId in pause", get().intervalId)
//     if (pauseFlag) {
//       const pte = new Date()
//       console.log("pte", pte)
//       // console.log("pte in sec", pte.getTime(), "startTimesec: ", get().startTimeSec)
//       set({ pauseEndTime: pte, pauseFlag: false })
//     }
//     clearInterval(get().intervalId);
//     set({ intervalId: null, isRunning: false });
//     console.log("pst: ", get().pauseStartTime)
//     console.log("pte: ", get().pauseEndTime);
//     console.log("sts: ", startTimeSec)
//     console.log("total pause time", (get().pauseEndTime.getTime() - get().startTime.getTime()) - (pauseEndTime.getTime() - pauseStartTime.getTime()))

//   },

//   reset: () => {
//     const { startTimeSec } = get()

//     console.log("intervalId in reset", get().intervalId)

//     clearInterval(get().intervalId);
//     const endTime = new Date();


//     const startTime = get().startTime;

//     console.log("⏹️ Session ended at:", endTime.toLocaleString());

//     set({ endTime: endTime })





//     console.log(startTime, " ", get().endTime)
//     console.log("end: ", get().endTime.getTime())
//     console.log("start: ", get().startTimeSec)

//     const totalTime = get().endTime.getTime() - startTimeSec
//     console.log("Total Time take to complete the task in sec: ", totalTime / 1000)

//     if (startTime) {
//       const duration = Math.floor((endTime - startTime) / 1000);
//       console.log("🕒 Total session duration:", duration, "seconds");
//     }

//     set({
//       seconds: 0,
//       intervalId: null,
//       isRunning: false,
//       startTime: null, // ✅ reset for next session
//     });
//   },
// }));


import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";


let screenshotTimeout = null; 

export const useScreenshotStore = create((set, get) => ({
  timeSheetId: null,
  remainingDelay: null,
  nextShotAt: null,
  screenshots: [],
  isRunning: false,

  // ---------------- RANDOM DELAY ----------------
  getRandomDelay: () => {
    const min = 0.3 * 60 * 1000; // 6 sec
    const max = 0.5 * 60 * 1000; // 12 sec
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // ---------------- SCHEDULING ----------------
  setSchedule: (delay) =>
    set({
      remainingDelay: delay,
      nextShotAt: Date.now() + delay,
    }),

  clearSchedule: () =>
    set({
      remainingDelay: null,
      nextShotAt: null,
    }),

  // ---------------- SCREENSHOT ----------------
  addScreenshot: (screenshot, screenshotTime) =>
    set((state) => ({
      screenshots: [...state.screenshots, { screenshot, screenshotTime }],
    })),

  clearScreenshots: () => set({ screenshots: [] }),

  // ---------------- SEND ----------------
  send_screenshot: async (data) => {
    try {
      const [{ apiKey }, { apiSecret }] = JSON.parse(
        localStorage.getItem("creds")
      );

      await axiosInstance.post(
        "/api/method/frappetrack.api.timesheet.upload_screenshot",
        data,
        {
          headers: {
            Authorization: `token ${apiKey}:${apiSecret}`,
          },
        }
      );

      return true;
    } catch (err) {
      console.error("Screenshot upload failed", err);
      return false;
    }
  },

  // ---------------- CAPTURE ----------------
  captureScreenshot: async () => {
    const { timeSheetId } = get();

    if (!timeSheetId) {
      console.warn("No timesheetId set, skipping screenshot");
      return false;
    }

    if (!window.electronAPI?.captureScreen) {
      console.warn("Electron API not available");
      return false;
    }

    const imgData = await window.electronAPI.captureScreen();

    // USER CLICKED CANCEL (Wayland)
    if (!imgData || !imgData.thumbnail) {
      console.warn("Screenshot cancelled by user");
      return false; // IMPORTANT
    }

    const fileData = imgData.thumbnail.split(",")[1];

    await get().send_screenshot({
      file_name: imgData.screenshotTime,
      file_data: fileData,
      timesheet_id: timeSheetId,
    });

    get().addScreenshot(imgData.thumbnail, imgData.screenshotTime);

    return true; // SUCCESS
  },


    // ---------------- LOOP ----------------
  startScreenshots: (timeSheetId) => {
    if (!timeSheetId) return;
    if (get().isRunning) return;

    set({ isRunning: true, timeSheetId });

    const retry = async () => {
      if (!get().isRunning) return;

      console.log("Retrying screenshot now");

      const ok = await get().captureScreenshot();

      if (!ok) {
        console.log("Retry cancelled again, retrying in 5 sec");
        screenshotTimeout = setTimeout(retry, 5_000);
        return;
      }

      // success → resume normal loop
      loop();
    };

    const loop = () => {
      if (!get().isRunning) return;

      const delay = get().getRandomDelay();
      console.log("📸 Next screenshot in", delay / 1000, "sec");

      screenshotTimeout = setTimeout(async () => {
        console.log("📸 Taking screenshot now");

        const ok = await get().captureScreenshot();

        if (!ok) {
          console.log("Screenshot failed, retry in 5 sec");
          screenshotTimeout = setTimeout(retry, 5_000);
          return;
        }

        loop();
      }, delay);
    };

    loop();
  },

  pauseScreenshots: () => {
    if (!screenshotTimeout) return;

    clearTimeout(screenshotTimeout);
    screenshotTimeout = null;

    const { nextShotAt } = get();
    if (nextShotAt) {
      set({ remainingDelay: Math.max(nextShotAt - Date.now(), 0) });
    }

    set({ isRunning: false });
  },

  stopScreenshots: () => {
    clearTimeout(screenshotTimeout);
    screenshotTimeout = null;

    set({
      isRunning: false,
      remainingDelay: null,
      nextShotAt: null,
      screenshots: [],
    });
  },
}));