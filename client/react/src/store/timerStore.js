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


      set({ startTime: formattedTime, startTimeSec: now.getTime() });
    } else {
      const pauseEndT = new Date().toLocaleTimeString()



      const pauseDiff = get().parseTime(pauseEndT) - get().parseTime(get().pauseStartTime);



      set({ totalPauseTime: get().totalPauseTime += pauseDiff, pauseFlag: false })

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
      set({ pauseStartTime: pauseTimeStart, pauseFlag: true });
   
    }


    clearInterval(get().intervalId);
    set({ intervalId: null, isRunning: false });
  },

  reset: () => {
    clearInterval(get().intervalId);

    const endTime = new Date().toLocaleTimeString();
    const { startTime, totalPauseTime } = get();
    const extract_start_time = startTime.substring(11, 22);


    const totalTimeDiff = get().parseTime(endTime) - get().parseTime(extract_start_time);

    const totalSessionTime = totalTimeDiff - totalPauseTime;

    set({ totalSessionTime: totalSessionTime })


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
