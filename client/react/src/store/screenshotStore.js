import { create } from "zustand";

export const useScreenshotStore = create((set) => ({
  remainingDelay: null,
  nextShotAt: null,
  screenshots: [],

  // screenshot scheduling
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

  // screenshots
  addScreenshot: (screenshot, screenshotTime) => {

    set((state) => ({ screenshots: [...state.screenshots, { screenshot, screenshotTime }] }))
  },

  clearScreenshots: () => set({ screenshots: [] }),
}));
