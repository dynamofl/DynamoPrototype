import type { ReactNode } from 'react';

interface GenericOverviewSectionLayoutProps {
  // Layout configuration
  gridColumns: 4 | 6;              // Total grid columns (4 or 6)
  descriptionColumns: 3;           // Columns for description section (always 3)
  gaugeColumns: 1 | 3;             // Columns for gauge section (1 or 3)

  // Content slots
  description: ReactNode;          // Evaluation-specific description
  gauges: ReactNode;               // Evaluation-specific gauge(s)
  additionalContent?: ReactNode;   // Optional content below (tables, cards, etc.)

  // Styling
  className?: string;              // Additional CSS classes
  containerPadding?: string;       // Custom padding
}

export function GenericOverviewSectionLayout({
  gridColumns,
  descriptionColumns,
  gaugeColumns,
  description,
  gauges,
  additionalContent,
  className = '',
  containerPadding = 'py-2'
}: GenericOverviewSectionLayoutProps) {
  // Use explicit classes to avoid Tailwind purge issues
  const gridClass = gridColumns === 6 ? 'grid-cols-6' : 'grid-cols-4';
  const gaugeColSpanClass = gaugeColumns === 3 ? 'col-span-3' : 'col-span-1';

  return (
    <div className={className}>
      <div className={`grid ${gridClass} mx-3 align-center items-center border-t border-dashed border-gray-200 ${containerPadding}`}>
        {/* Description Section */}
        <div className="col-span-3">
          <div className="text-base text-gray-900 leading-relaxed py-4">
            {description}
          </div>
        </div>

        {/* Gauge Section */}
        <div className={`${gaugeColSpanClass} flex justify-center items-start pt-4`}>
          {gauges}
        </div>
      </div>

      {/* Additional Content (optional) */}
      {additionalContent && (
        <div className="px-3 py-3">
          {additionalContent}
        </div>
      )}
    </div>
  );
}
