import type { SummaryTextSectionProps } from "./types";

export function SummaryTextSection({
  title,
  description,
  topDescription,
  bottomDescription,
  className = "",
}: SummaryTextSectionProps) {
  return (
    <div className={`max-w-4xl mx-auto space-y-4 my-4 ${className}`}>
      <div className="space-y-3 pt-4 pb-2 rounded-xl">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3">
            <p className="text-sm font-550 leading-4 text-gray-900">{title}</p>
          </div>
        </div>

        {/* Top Description */}
        {topDescription && (
          <div className="space-y-2 px-3">
            <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
              {topDescription}
            </p>
          </div>
        )}

        {/* Main Description */}
        {description && (
          <div className="space-y-2 px-3">
            <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Bottom Description */}
        {bottomDescription && (
          <div className="space-y-2 px-3">
            <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
              {bottomDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data example for demonstration
export const mockTextSectionData: SummaryTextSectionProps = {
  title: "Executive Summary",
  description:
    "This evaluation assesses the system's performance across multiple attack vectors and compliance scenarios. Results indicate strong defensive capabilities with targeted areas for improvement.",
};

// Example with top description
export const mockTextSectionWithTopDescription: SummaryTextSectionProps = {
  title: "Key Findings",
  topDescription:
    "The following analysis provides critical insights into system behavior patterns observed during the evaluation period.",
  description:
    "The evaluation identified several critical patterns in system behavior, including consistent performance across common attack vectors and areas requiring enhanced monitoring. Overall system resilience demonstrates maturity with opportunities for continued refinement.",
};

// Example with both top and bottom descriptions
export const mockTextSectionWithBothDescriptions: SummaryTextSectionProps = {
  title: "Methodology Overview",
  topDescription:
    "This section outlines the approach used for conducting the comprehensive evaluation.",
  description:
    "The evaluation methodology combines automated testing with manual review processes. Tests were executed across multiple scenarios to ensure comprehensive coverage. All results were validated against established baselines and industry standards.",
  bottomDescription:
    "Results reflect a 30-day evaluation period with continuous monitoring and analysis.",
};
