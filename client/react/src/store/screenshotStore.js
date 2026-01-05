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
  addScreenshot: (imgData) =>
    set((state) => ({ screenshots: [...state.screenshots, imgData] })),
  clearScreenshots: () => set({ screenshots: [] }),
}));
