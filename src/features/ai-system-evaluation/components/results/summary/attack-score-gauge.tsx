import { useState, useEffect } from "react";
import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";
import { cn } from "@/lib/utils";

interface AttackScoreGaugeProps {
  value: number;  // Success rate value (0-100)
  label?: string; // Optional custom label (defaults to "Attack Success Rate")
}

export function AttackScoreGauge({ value, label = "Attack Success Rate" }: AttackScoreGaugeProps) {
  const successRate = value;
  const [animatedValue, setAnimatedValue] = useState(0);

  // Gauge configuration
  const config = {
    width: 160,
    height: 100,
    cx: 80,
    cy: 80,
    radius: 70, // Single radius for stroke-based arc
    strokeWidth: 6, // Width of the arc stroke
    startAngle: -90, // Start from left (-90 degrees)
    endAngle: 90,    // End at right (90 degrees)
    animationDuration: 1500,
  };

  useEffect(() => {
    const steps = 60;
    const stepValue = successRate / steps;
    const stepDuration = config.animationDuration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedValue(stepValue * currentStep);
      } else {
        setAnimatedValue(successRate);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [successRate]);

  // Helper function to convert polar to cartesian coordinates
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // Create arc path for stroke-based rendering (with rounded caps)
  const createStrokeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(config.cx, config.cy, config.radius, startAngle);
    const end = polarToCartesian(config.cx, config.cy, config.radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", config.radius, config.radius, 0, largeArcFlag, 1, end.x, end.y,
    ].join(" ");
  };

  // Calculate color based on success rate (Tailwind colors)
  const getColor = (rate: number) => {
    if (rate < 30) return "rgb(34 197 94)"; // green-500
    if (rate < 60) return "rgb(251 191 36)"; // amber-400
    return "rgb(239 68 68)"; // red-500
  };

  // Get background arc color (works with dark mode)
  const getBackgroundColor = () => {
    // Using getComputedStyle to get the actual color from Tailwind classes
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? "rgb(55 65 81)" : "rgb(229 231 235)"; // gray-700 : gray-200
    }
    return "rgb(229 231 235)"; // fallback to gray-200
  };

  // Get text color class based on success rate
  const getTextColorClass = (rate: number) => {
    if (rate < 30) return "text-gray-900 ";
    if (rate < 60) return "text-gray-900 ";
    return "text-gray-900";
  };

  // Calculate the current angle for the animated arc
  const currentAngle = config.startAngle + (animatedValue / 100) * (config.endAngle - config.startAngle);

  return (
    <div className="flex flex-col items-center justify-center mt-4">
           {/* Label below gauge */}
      {label && (
      <p className="text-xs font-450 text-gray-900 text-center mb-1">
        {label}
      </p>
      )}
      <div className="relative w-full flex justify-center">
        
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="block"
        >
          {/* Background arc (gray) - full semi-circle */}
          <path
            d={createStrokeArc(config.startAngle, config.endAngle)}
            stroke={getBackgroundColor()}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Animated colored arc - fills from left to current value */}
          <path
            d={createStrokeArc(config.startAngle, currentAngle)}
            stroke={getColor(animatedValue)}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Centered text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <p className={cn(
            "text-lg font-550 transition-colors duration-300",
            getTextColorClass(animatedValue)
          )}>
            {animatedValue.toFixed(1)}%
          </p>
          <p className="text-[0.75rem] text-gray-600 ">
            {successRate < 30 ? "Well Protected" :
             successRate < 60 ? "Moderate Risk" : "High Vulnerability"}
          </p>
        </div>
      </div>
     
    </div>
  );
}
