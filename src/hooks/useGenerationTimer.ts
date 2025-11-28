import { useEffect, useState } from 'react';

export function useGenerationTimer(isGenerating: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: number | undefined;

    if (isGenerating) {
      setSeconds(0); // reset on start
      interval = window.setInterval(() => {
        setSeconds((prev) => +(prev + 0.1).toFixed(1)); // Increment by 0.1s, avoid floating point drift
      }, 100); // Update every 100ms
    } else {
      setSeconds(0); // reset when generation stops
    }

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [isGenerating]);

  return seconds;
}
