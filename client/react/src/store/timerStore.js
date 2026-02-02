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
  pauseEndTime: null,
  totalPauseTime: null, // in milliseconds,
  totalSessionTime: null,
  parseTime: (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes, seconds] = time.split(':').map(Number);
    console.log(hours)

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  },
  start: () => {
    if (get().intervalId) return;

    if (!get().startTime) {
      const now = new Date();

      // const formattedTime = now
      //   .toLocaleString('en-US', { // Use en-US for AM/PM
      //     year: 'numeric',
      //     month: '2-digit',
      //     day: '2-digit',
      //     hour: '2-digit',
      //     minute: '2-digit',
      //     second: '2-digit',
      //     hour12: true // Important for AM/PM
      //   })
      //   .replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2'); // Convert MM/DD/YYYY → YYYY-MM-DD
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
    } else {
      const pauseEndT = new Date().toLocaleTimeString()
      console.log("Paused end time is", pauseEndT)


      const pauseDiff = get().parseTime(pauseEndT) - get().parseTime(get().pauseStartTime);
      console.log("diff", pauseDiff)
      // const totalSeconds = Math.floor(pauseDiff / 1000);
      // const hours = Math.floor(totalSeconds / 3600);
      // const minutes = Math.floor((totalSeconds % 3600) / 60);
      // const seconds = totalSeconds % 60;

      // get().totalPauseTime += pauseDiff


      set({ totalPauseTime: get().totalPauseTime += pauseDiff, pauseFlag: false })
      console.log("total", get().totalPauseTime)
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
      const pauseTimeStart = new Date().toLocaleTimeString();
      console.log("pause started time", pauseTimeStart);
      set({ pauseStartTime: pauseTimeStart, pauseFlag: true });
      console.log("⏸️ Paused at:", pauseTimeStart);
    }


    clearInterval(get().intervalId);
    set({ intervalId: null, isRunning: false });
  },

  reset: () => {
    clearInterval(get().intervalId);

    const endTime = new Date().toLocaleTimeString();
    const { startTime, totalPauseTime } = get();
    const extract_start_time = startTime.substring(11, 22);
    console.log("⏹️ Session ended at:", extract_start_time);
    console.log("⏹️ Session ended end:", endTime);

    const totalTimeDiff = get().parseTime(endTime) - get().parseTime(extract_start_time);
    console.log("totalDiffTIme", totalTimeDiff)
    const totalSessionTime = totalTimeDiff - totalPauseTime;
    console.log(totalSessionTime)
    set({ totalSessionTime: totalSessionTime })
    console.log("updated", get().totalSessionTime)

    // const totalTime = endTime.getTime() - startTimeSec;
    // const effectiveTime = totalTime - totalPauseTime;

    // console.log("Total session time (sec):", totalTime / 1000);
    // console.log("Total pause time (sec):", totalPauseTime / 1000);
    // console.log("Effective working time (sec):", effectiveTime / 1000);

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
