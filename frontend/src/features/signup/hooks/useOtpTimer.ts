import { useState, useEffect, useCallback } from 'react';

/**
 * A hook to manage the OTP resend timer countdown.
 * @param initialSeconds Number of seconds to count down from
 * @returns { timeLeft, isFinished, start, reset }
 */
export function useOtpTimer(initialSeconds: number = 60) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const reset = useCallback((newInitialSeconds?: number) => {
    setTimeLeft(newInitialSeconds ?? initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [isActive, timeLeft]);

  // Derive isFinished from timeLeft
  const isFinished = timeLeft === 0;

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isFinished,
    start,
    reset,
  };
}
