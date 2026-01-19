import { create } from "zustand";

export const useTimerStore = create((set, get) => ({
  seconds: 0,
  isRunning: false,
  intervalId: null,

  startTime: null,
  endTime: null,
  startTimeSec: null,

  pauseFlag: false,
  pauseStartTime: null,
  totalPauseTime: 0, // in milliseconds

  start: () => {
    if (get().intervalId) return;

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
        .replace(/\//g, '-')
        .replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')
        .replace(', ', ' ');

      console.log("⏱️ Session started at:", formattedTime);
      set({ startTime: formattedTime, startTimeSec: now.getTime() });
    }

    const id = setInterval(() => {
      set((state) => ({ seconds: state.seconds + 1 }));
    }, 1000);

    set({ intervalId: id, isRunning: true });
  },

  pause: () => {
    const { pauseFlag } = get();

    if (!pauseFlag) {
      // Start pause
      const pst = new Date();
      set({ pauseStartTime: pst, pauseFlag: true });
      console.log("⏸️ Paused at:", pst.toLocaleTimeString());
    } else {
      // End pause
      const pte = new Date();
      const pauseDuration = pte.getTime() - get().pauseStartTime.getTime();

      set((state) => ({
        pauseFlag: false,
        totalPauseTime: state.totalPauseTime + pauseDuration,
        pauseStartTime: null,
      }));

      console.log("▶️ Resumed at:", pte.toLocaleTimeString());
      console.log("⏱️ Pause duration (sec):", pauseDuration / 1000);
    }

    clearInterval(get().intervalId);
    set({ intervalId: null, isRunning: false });
  },

  reset: () => {
    clearInterval(get().intervalId);

    const endTime = new Date();
    const { startTimeSec, totalPauseTime } = get();

    console.log("⏹️ Session ended at:", endTime.toLocaleString());

    const totalTime = endTime.getTime() - startTimeSec;
    const effectiveTime = totalTime - totalPauseTime;

    console.log("Total session time (sec):", totalTime / 1000);
    console.log("Total pause time (sec):", totalPauseTime / 1000);
    console.log("Effective working time (sec):", effectiveTime / 1000);
    
    

    // Reset store
    set({
      seconds: 0,
      intervalId: null,
      isRunning: false,
      startTime: null,
      endTime: null,
      pauseFlag: false,
      pauseStartTime: null,
      totalPauseTime: 0,
    });
  },
}));
