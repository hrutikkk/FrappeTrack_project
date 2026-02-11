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
    const min = 7 * 60 * 1000; // 6 sec
    const max = 10 * 60 * 1000; // 12 sec
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

      const res = await axiosInstance.post("method/frappetrack.api.timesheet.upload_screenshot", data)
      if (res) {

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
      return;
    }

    if (!timeSheetId) return;
    if (!window.electronAPI?.captureScreen) return;

    const imgData = await window.electronAPI.captureScreen();
    if (!imgData?.thumbnail) return;
    const dataUrl = imgData.thumbnail;

    // Split metadata and actual data
    const [meta, base64Data] = dataUrl.split(",");

    // Extract mime type → image/png
    const mimeType = meta.match(/data:(.*);base64/)[1];


    await get().send_screenshot({
      file_name: imgData.screenshotTime, // backend will append .png
      file_data: base64Data,             // ONLY base64
      mime_type: mimeType,               // VERY IMPORTANT
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


  },



}));
