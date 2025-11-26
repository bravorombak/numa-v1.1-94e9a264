import { useEffect, useState } from 'react';

export function useGenerationTimer(isGenerating: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: number | undefined;

    if (isGenerating) {
      setSeconds(0); // reset on start
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
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
