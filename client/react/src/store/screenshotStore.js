// store/screenshotStore.js
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

let screenshotTimeout = null; // 🔥 GLOBAL (not tied to component)

export const useScreenshotStore = create((set, get) => ({
  timeSheetId: null,
  remainingDelay: null,
  nextShotAt: null,
  screenshots: [],
  isRunning: false,

  // ---------------- RANDOM DELAY ----------------
  getRandomDelay: () => {
    const min = 0.1 * 60 * 1000; // 6 sec
    const max = 0.2 * 60 * 1000; // 12 sec
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
      console.log("send screenshot", data)
      const res = axiosInstance.post("/api/method/frappetrack.api.timesheet.upload_screenshot", data)
      if (res) {
        console.log("send screenshot via post")
        return true;
      }

    } catch (err) {
      console.error("Screenshot upload failed", err);
      return false;
    }
  },

  // ---------------- CAPTURE ----------------
  captureScreenshot: async () => {
    const { timeSheetId, isRunning } = get();

    // 🔒 ABSOLUTE GUARD
    if (!isRunning) {
      console.log(" Screenshot blocked (paused)");
      return;
    }

    if (!timeSheetId) return;
    if (!window.electronAPI?.captureScreen) return;

    const imgData = await window.electronAPI.captureScreen();
    if (!imgData?.thumbnail) return;

    const fileData = imgData.thumbnail.split(",")[1];

    await get().send_screenshot({
      file_name: imgData.screenshotTime,
      file_data: fileData,
      timesheet_id: timeSheetId,
    });

    get().addScreenshot(imgData.thumbnail, imgData.screenshotTime);
  },



  // ---------------- LOOP ----------------
  startScreenshots: (timeSheetId) => {
    if (!timeSheetId) return;
    if (get().isRunning) return;

    set({ isRunning: true, timeSheetId });

    const takeScreenshotLoop = () => {
      if (!get().isRunning) return;

      // 👇 consume remainingDelay ONCE
      const delay =
        get().remainingDelay !== null
          ? get().remainingDelay
          : get().getRandomDelay();

      // IMPORTANT: clear remainingDelay immediately
      set({
        remainingDelay: null,
        nextShotAt: Date.now() + delay,
      });

      console.log("📸 Next screenshot in", delay / 1000, "sec");

      screenshotTimeout = setTimeout(async () => {
        if (!get().isRunning) return;

        await get().captureScreenshot();

        set({ nextShotAt: null });
        takeScreenshotLoop();
      }, delay);
    };

    takeScreenshotLoop();
  },


  pauseScreenshots: () => {
    if (screenshotTimeout) {
      clearTimeout(screenshotTimeout);
      screenshotTimeout = null;
    }

    const { nextShotAt } = get();

    if (nextShotAt) {
      const remaining = Math.max(0, nextShotAt - Date.now());

      set({
        remainingDelay: remaining,
        nextShotAt: null,
        isRunning: false,
      });

      console.log("⏸ Screenshot paused, remaining:", remaining / 1000, "sec");
    } else {
      set({ isRunning: false });
    }
  },

  stopScreenshots: () => {
    if (screenshotTimeout) clearTimeout(screenshotTimeout);
    screenshotTimeout = null;

    set({
      isRunning: false,
      remainingDelay: null,
      nextShotAt: null,
      screenshots: [],
    });

    console.log("📸 Screenshots stopped");
  },



}));
