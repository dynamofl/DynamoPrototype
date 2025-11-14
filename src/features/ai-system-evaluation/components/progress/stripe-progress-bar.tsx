import React from 'react';

interface StripeProgressBarProps {
  progress: number;
  isPreparing?: boolean;
}

/**
 * StripeProgressBar - Animated progress bar component
 *
 * Features:
 * - Stripe-style animated loading when preparing (isPreparing is true and progress is 0%)
 * - Standard progress bar when progress > 0%
 * - Smooth transitions between states
 * - Uses amber color scheme per project guidelines
 */
export const StripeProgressBar: React.FC<StripeProgressBarProps> = ({
  progress,
  isPreparing = false
}) => {
  const showStripeAnimation = isPreparing && progress === 0;

  return (
    <div className="w-full">
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden relative">
        {showStripeAnimation ? (
          // Animated stripe-style loading for preparing state
          <>
            <style>
              {`
                @keyframes stripes {
                  0% {
                    background-position: 0 0;
                  }
                  100% {
                    background-position: 28px 0;
                  }
                }
              `}
            </style>
            <div
              className="h-full w-full absolute inset-0 bg-amber-500"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.2) 0px, rgba(255,255,255,.2) 10px, transparent 10px, transparent 20px)',
                backgroundSize: '28px 28px',
                backgroundPosition: '0 0',
                animation: 'stripes 1s linear infinite'
              }}
            />
          </>
        ) : (
          // Normal progress bar for active progress
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${Math.round(progress)}%` }}
          />
        )}
      </div>
    </div>
  );
};
