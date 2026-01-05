// store/timerStore.js
import { create } from "zustand";

export const useTimerStore = create((set, get) => ({
  seconds: 0,
  isRunning: false,
  intervalId: null,
  startTime: null,

  start: () => {
    if (get().intervalId) return;

    // ✅ set startTime only once
    if (!get().startTime) {
      const now = new Date();
      console.log("⏱️ Session started at:", now.toLocaleString());
      set({ startTime: now });
    }

    const id = setInterval(() => {
      set((state) => ({ seconds: state.seconds + 1 }));
    }, 1000);

    set({ intervalId: id, isRunning: true });
  },

  pause: () => {
    clearInterval(get().intervalId);
    set({ intervalId: null, isRunning: false });
  },

  reset: () => {
    clearInterval(get().intervalId);

    const endTime = new Date();
    const startTime = get().startTime;

    console.log("⏹️ Session ended at:", endTime.toLocaleString());

    if (startTime) {
      const duration = Math.floor((endTime - startTime) / 1000);
      console.log("🕒 Total session duration:", duration, "seconds");
    }

    set({
      seconds: 0,
      intervalId: null,
      isRunning: false,
      startTime: null, // ✅ reset for next session
    });
  },
}));
