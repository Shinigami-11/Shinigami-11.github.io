import { useEffect, useState } from "react";

interface CircleTimerProps {
  duration: number;
  isRunning: boolean;
  onComplete?: () => void;
}

export default function CircleTimer({ duration, isRunning, onComplete }: CircleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration);
      return;
    }
    
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [duration, isRunning, onComplete]);
  
  const strokeDashoffset = circumference * (1 - timeLeft / duration);
  
  return (
    <div className="relative h-10 w-10">
      <svg className="h-10 w-10" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="2"
        />
        <circle
          className="transition-all duration-1000 ease-linear"
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 18 18)"
          style={{ color: timeLeft <= 2 ? "#f44336" : "#ff4081" }}
        />
      </svg>
      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-neutral-700">
        {timeLeft}
      </span>
    </div>
  );
}
