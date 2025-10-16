// Individual Metric Card Component

interface SummaryMetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function SummaryMetricCard({
  label,
  value,
  description,
  variant = 'default',
}: SummaryMetricCardProps) {
  // Determine text color based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          label: 'text-green-700',
          value: 'text-green-900',
          description: 'text-green-600',
        };
      case 'warning':
        return {
          label: 'text-amber-700',
          value: 'text-amber-900',
          description: 'text-amber-600',
        };
      case 'danger':
        return {
          label: 'text-red-700',
          value: 'text-red-900',
          description: 'text-red-600',
        };
      default:
        return {
          label: 'text-gray-600',
          value: 'text-gray-900',
          description: 'text-gray-500',
        };
    }
  };

  const colors = getVariantColors();

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-0">
      <p className={`text-xs ${colors.label}`}>{label}</p>
      <p className={`text-3xl font-semibold mt-2 ${colors.value}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {description && (
        <p className={`text-xs mt-2 ${colors.description}`}>{description}</p>
      )}
    </div>
  );
}
