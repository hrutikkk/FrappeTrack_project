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
      const res = axiosInstance.post("/api/method/frappetrack.api.timesheet.upload_screenshot",data)
      if(res){
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
  const { timeSheetId } = get(); // ✅ CORRECT

  if (!timeSheetId) {
    console.warn("❌ No timesheetId set, skipping screenshot");
    return;
  }

  if (!window.electronAPI?.captureScreen) {
    console.warn("❌ Electron API not available");
    return;
  }

  const imgData = await window.electronAPI.captureScreen();

  if (!imgData?.thumbnail) return;

  const fileData = imgData.thumbnail.split(",")[1];

  await get().send_screenshot({
    file_name: imgData.screenshotTime,
    file_data: fileData,
    timesheet_id: timeSheetId, // ✅ SAFE
  });

  get().addScreenshot(imgData.thumbnail, imgData.screenshotTime);
},


  // ---------------- LOOP ----------------
startScreenshots: (timeSheetId) => {
  if (!timeSheetId) {
    console.warn("❌ startScreenshots called without timesheetId");
    return;
  }

  if (get().isRunning) return;

  set({ isRunning: true, timeSheetId });

  const loop = async () => {
    if (!get().isRunning) return;

    const delay = get().remainingDelay ?? get().getRandomDelay();
    console.log("📸 Next screenshot in", delay / 1000, "sec");

    get().setSchedule(delay);

    screenshotTimeout = setTimeout(async () => {
      console.log("📸 Taking screenshot now");

      get().clearSchedule();
      await get().captureScreenshot();
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
