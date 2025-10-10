import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface OverviewSectionProps {
  summary: JailbreakEvaluationOutput['summary'];
}

function GaugeChart({ value }: { value: number }) {
  // Calculate the angle for the gauge (0-180 degrees)
  const angle = (value / 100) * 180;

  // Create the arc path for the background gauge (0-100%)
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(101, 101, radius, endAngle);
    const end = polarToCartesian(101, 101, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="relative inline-grid place-items-start shrink-0">
      <svg width="202" height="119" viewBox="0 0 202 119" fill="none" className="relative">
        {/* Background gauge (gray) */}
        <path
          d={createArc(0, 180, 86)}
          stroke="#E5E7EB"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        {/* Active gauge (green) */}
        <path
          d={createArc(0, angle, 86)}
          stroke="#22A06B"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 mt-8">
        <div className="flex items-end gap-1">
          <span className="text-[32px] font-bold leading-[40px] text-gray-900 tracking-[-0.32px]">
            {value}
          </span>
          <span className="text-base font-medium leading-6 text-gray-600 pb-[2px]">%</span>
        </div>
        <p className="text-xs font-semibold leading-4 text-gray-600 text-center w-[122px]">
          Attack Success Rate
        </p>
      </div>

      {/* Labels */}
      <span className="absolute bottom-0 left-0 text-[10px] font-semibold leading-4 text-gray-600 px-1">0</span>
      <span className="absolute bottom-0 right-0 text-[10px] font-semibold leading-4 text-gray-600 px-1">100</span>
      <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-semibold leading-4 text-gray-600 px-1">50</span>
      <span className="absolute top-[38px] left-4 text-[10px] font-semibold leading-4 text-gray-600 px-1">25</span>
      <span className="absolute top-[38px] right-4 text-[10px] font-semibold leading-4 text-gray-600 px-1">75</span>
    </div>
  );
}

function getRiskLevel(successRate: number): string {
  if (successRate < 10) return "low risk level";
  if (successRate < 30) return "moderate risk level";
  if (successRate < 50) return "elevated risk level";
  return "high risk level";
}

export function OverviewSection({ summary }: OverviewSectionProps) {
  const policyCount = Object.keys(summary.byPolicy).length;
  const riskLevel = getRiskLevel(summary.successRate);

  return (
    <div className="text-sm space-y-2">
      {/* Description */}
        <h3 className="font-semibold text-gray-900">Overview</h3>

      <p className="text-gray-900 leading-relaxed">
        The system demonstrates resilience against jailbreak attacks, with an attack success rate of{' '}
        <span className="text-gray-900 font-medium">{summary.successRate.toFixed(1)}%</span> across{' '}
        <span className="text-gray-900 font-medium">{summary.totalTests}</span> adversarial prompts spanning{' '}
        <span className="text-gray-900 font-medium">{policyCount}</span> policy areas. This indicates a{' '}
        <span className="text-gray-900 font-medium">{riskLevel}</span> in deployment.
      </p>
    </div>
  );
}
