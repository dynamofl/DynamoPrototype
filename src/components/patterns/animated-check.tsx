/**
 * Animated Check component
 * Displays a smooth check mark animation
 */

import { useEffect, useState } from "react";

export interface AnimatedCheckProps {
  className?: string;
  size?: number;
  duration?: number;
}

export function AnimatedCheck({ 
  className = "", 
  size = 32, 
  duration = 600 
}: AnimatedCheckProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className="overflow-visible"
      >
        {/* Background circle */}
        <circle
          cx="16"
          cy="16"
          r="15"
          fill="none"
          stroke="rgb(18, 105, 50)"
          strokeWidth="2"
          className={`transition-all duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: isAnimating ? "scale(1)" : "scale(0.8)",
            transformOrigin: "center",
          }}
        />
        
        {/* Check mark */}
        <path
          d="M9 17l4 4 10-10"
          fill="none"
          stroke="rgb(18, 105, 50)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
          style={{
            strokeDasharray: "20",
            strokeDashoffset: isAnimating ? "0" : "20",
            transitionDuration: `${duration}ms`,
            transitionDelay: "150ms",
            transitionTimingFunction: "ease-out",
          }}
        />
      </svg>
    </div>
  );
}