import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GaugeConfig {
  value: number;
  label: string;
  getColor?: (value: number) => string;
  getStatusLabel?: (value: number) => string;
}

interface UnifiedEvaluationGaugeProps {
  primary: GaugeConfig;
  secondary?: GaugeConfig;
}

function SingleGauge({ value, label, getColor, getStatusLabel }: GaugeConfig) {
  const successRate = value;
  const [animatedValue, setAnimatedValue] = useState(0);

  // Gauge configuration (same as AttackScoreGauge)
  const config = {
    width: 160,
    height: 100,
    cx: 80,
    cy: 80,
    radius: 70,
    strokeWidth: 6,
    startAngle: -90,
    endAngle: 90,
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

  // Create arc path for stroke-based rendering
  const createStrokeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(config.cx, config.cy, config.radius, startAngle);
    const end = polarToCartesian(config.cx, config.cy, config.radius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", config.radius, config.radius, 0, largeArcFlag, 1, end.x, end.y,
    ].join(" ");
  };

  // Get color based on value
  const gaugeColor = getColor ? getColor(animatedValue) : "rgb(34 197 94)";

  // Get status label
  const statusLabel = getStatusLabel ? getStatusLabel(successRate) : null;

  // Get background arc color
  const getBackgroundColor = () => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? "rgb(55 65 81)" : "rgb(229 231 235)";
    }
    return "rgb(229 231 235)";
  };

  // Calculate the current angle for the animated arc
  const currentAngle = config.startAngle + (animatedValue / 100) * (config.endAngle - config.startAngle);

  return (
    <div className="flex flex-col items-center justify-center mt-4">
      {/* Label above gauge */}
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

          {/* Animated colored arc */}
          <path
            d={createStrokeArc(config.startAngle, currentAngle)}
            stroke={gaugeColor}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Centered text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <p className={cn(
            "text-lg font-550 transition-colors duration-300 text-gray-900"
          )}>
            {animatedValue.toFixed(1)}%
          </p>
          {statusLabel && (
            <p className="text-[0.75rem] text-gray-600">
              {statusLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function UnifiedEvaluationGauge({ primary, secondary }: UnifiedEvaluationGaugeProps) {
  if (secondary) {
    // Dual gauge layout
    return (
      <div className="flex gap-2 items-end justify-end">
        <SingleGauge {...primary} />
        <SingleGauge {...secondary} />
      </div>
    );
  }

  // Single gauge layout
  return (
    <div className="flex justify-end pr-3">
      <SingleGauge {...primary} />
    </div>
  );
}
