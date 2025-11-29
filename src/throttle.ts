export const throttle = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T => {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    } else {
      lastArgs = args;

      if (!timeoutId) {
        const remaining = delay - (now - lastCall);

        timeoutId = setTimeout(() => {
          timeoutId = null;
          lastCall = Date.now();
          if (lastArgs) fn(...lastArgs);
          lastArgs = null;
        }, remaining);
      }
    }
  } as T;

  return throttled;
}
