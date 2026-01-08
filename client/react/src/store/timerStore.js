// store/timerStore.js
import { create } from "zustand";

export const useTimerStore = create((set, get) => ({
  seconds: 0,
  isRunning: false,
  intervalId: null,
  
  startTime: null,
  endTime: null,
  totalTime: null,
  startTimeSec: null,
  pauseFlag: false,
  pauseStartTime: null,
  pauseEndTime: null,


  start: () => {
    if (get().intervalId) return;
    console.log("intervalId in start", get().intervalId)

    // ✅ set startTime only once
    if (!get().startTime) {
      const now = new Date();

      const formattedTime = now
        .toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23'
        })
        .replace(/\//g, '-')                         // 06-01-2026, 03:56:36
        .replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1') // 2026-01-06, 03:56:36
        .replace(', ', ' ');                         // remove comma
      console.log("⏱️ Session started at:", formattedTime);
      set({ startTime: formattedTime, startTimeSec: now.getTime() });
    }

    const id = setInterval(() => {
      set((state) => ({ seconds: state.seconds + 1 }));
    }, 1000);

    set({ intervalId: id, isRunning: true });
  },

  pause: () => {
    const { pauseFlag, startTime, startTimeSec } = get()
    if (!pauseFlag) {
      const pst = new Date()
      set({ pauseStartTime: pst, pauseFlag: true })
    }
    // console.log("intervalId in pause", get().intervalId)
    if (pauseFlag) {
      const pte = new Date()
      console.log("pte", pte)
      // console.log("pte in sec", pte.getTime(), "startTimesec: ", get().startTimeSec)
      set({ pauseEndTime: pte, pauseFlag: false })
    }
    clearInterval(get().intervalId);
    set({ intervalId: null, isRunning: false });
    console.log("pst: ", get().pauseStartTime)
    console.log("pte: ", get().pauseEndTime);
    console.log("sts: ", startTimeSec)
    console.log("total pause time", (get().pauseEndTime.getTime() - get().startTime.getTime()) - (pauseEndTime.getTime() - pauseStartTime.getTime()))

  },

  reset: () => {
    const { startTimeSec } = get()

    console.log("intervalId in reset", get().intervalId)

    clearInterval(get().intervalId);
    const endTime = new Date();


    const startTime = get().startTime;

    console.log("⏹️ Session ended at:", endTime.toLocaleString());

    set({ endTime: endTime })





    console.log(startTime, " ", get().endTime)
    console.log("end: ", get().endTime.getTime())
    console.log("start: ", get().startTimeSec)

    const totalTime = get().endTime.getTime() - startTimeSec
    console.log("Total Time take to complete the task in sec: ", totalTime / 1000)

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
