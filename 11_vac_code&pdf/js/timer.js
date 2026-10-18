// timer.js - countdown logic built on setInterval()
export function createTimer({ onTick, onFinish }) {
  let remaining = 0;
  let id = null;

  function stop() {
    if (id !== null) {
      clearInterval(id);
      id = null;
    }
  }

  function set(seconds) {
    stop();
    remaining = Math.max(0, Math.floor(seconds));
    onTick(remaining);
  }

  function start() {
    if (id !== null || remaining <= 0) return;
    id = setInterval(() => {
      remaining -= 1;
      onTick(remaining);
      if (remaining <= 0) {
        stop();
        onFinish();
      }
    }, 1000);
  }

  return {
    set,
    start,
    pause: stop,
    get remaining() { return remaining; },
    get running() { return id !== null; },
  };
}
