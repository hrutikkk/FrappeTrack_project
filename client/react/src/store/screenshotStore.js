import axios from "axios";
import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

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

  //send screenshot function
  send_screenshot: async (data) => {
    try {
      console.log("send screenshot", data)
      const [{ apiKey }, { apiSecret }] = JSON.parse(localStorage.getItem("creds"));
      const res = axiosInstance.post("/api/method/frappetrack.api.timesheet.upload_screenshot",data, {
        headers: {
          'Authorization': `token ${apiKey}:${apiSecret}`,
        },
      })
      if(res){
        console.log("send screenshot via post")
        return true;
      }

    } catch (error) {
      console.log("Error while sending screenshot",error)
      return false;

    }
  },

  clearScreenshots: () => set({ screenshots: [] }),
}));
