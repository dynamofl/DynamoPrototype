import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../../components/ui/progress';
import { useState, useEffect } from 'react';

const meta: Meta<typeof Progress> = {
  title: 'Feedback/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Progress indicators show the completion status of a task or operation. They provide visual feedback to users about ongoing processes, helping them understand how much work has been completed and how much remains. Use progress bars for tasks with known duration or measurable progress.`,
      },
      toc: {
        headingSelector: 'h3',
        title: '',
        disable: false,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value as a percentage (0-100)',
      table: {
        type: { summary: 'number' },
        category: 'State',
      },
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value for the progress bar',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
        category: 'State',
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for styling',
      table: {
        type: { summary: 'string' },
        category: 'Appearance',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic Variants
 *
 * Simple progress bars showing different completion states.
 *
 * Default progress bar at 33% completion.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    value: 33,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic progress bar showing one-third completion. Use this for simple progress indication.',
      },
    },
  },
};

/**
 * Empty progress bar at 0% completion.
 */
export const Empty: Story = {
  tags: ['!dev'],
  args: {
    value: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at the start with no progress made yet.',
      },
    },
  },
};

/**
 * Progress bar at 50% completion.
 */
export const Half: Story = {
  tags: ['!dev'],
  args: {
    value: 50,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at halfway point.',
      },
    },
  },
};

/**
 * Progress bar nearing completion at 90%.
 */
export const AlmostComplete: Story = {
  tags: ['!dev'],
  args: {
    value: 90,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar almost finished, useful for showing tasks nearly complete.',
      },
    },
  },
};

/**
 * Fully completed progress bar at 100%.
 */
export const Complete: Story = {
  tags: ['!dev'],
  args: {
    value: 100,
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed progress bar showing task is finished.',
      },
    },
  },
};

/**
 * ### With Labels
 *
 * Progress bars with accompanying text labels and percentages.
 *
 * Progress bar with label and percentage display.
 */
export const WithLabel: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2 w-80">
      <div className="flex justify-between text-[0.8125rem]">
        <span className="text-gray-900">Progress</span>
        <span className="text-gray-600">33%</span>
      </div>
      <Progress value={33} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with descriptive label and percentage indicator. This pattern helps users understand what is progressing and by how much.',
      },
    },
  },
};

/**
 * Multiple progress bars showing different stages of a multi-step process.
 */
export const LoadingExample: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Uploading Files...</span>
          <span className="text-gray-600">45%</span>
        </div>
        <Progress value={45} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Processing Data...</span>
          <span className="text-gray-600">78%</span>
        </div>
        <Progress value={78} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Finalizing...</span>
          <span className="text-gray-600">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing multiple simultaneous operations, each with their own progress indicator.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Real-world usage patterns and complete implementations.
 *
 * Comparison of different progress values side by side.
 */
export const DifferentValues: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Starting</span>
          <span className="text-gray-600">0%</span>
        </div>
        <Progress value={0} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">In Progress</span>
          <span className="text-gray-600">25%</span>
        </div>
        <Progress value={25} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Halfway</span>
          <span className="text-gray-600">50%</span>
        </div>
        <Progress value={50} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Almost Done</span>
          <span className="text-gray-600">75%</span>
        </div>
        <Progress value={75} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Complete</span>
          <span className="text-gray-600">100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of progress bars at different completion stages from 0% to 100%.',
      },
    },
  },
};

/**
 * Project tracking with multiple task progress indicators.
 */
export const TaskProgress: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <h3 className="text-lg font-medium text-gray-900">Project Progress</h3>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem]">
            <span className="text-gray-900">Design Phase</span>
            <span className="text-gray-600">100%</span>
          </div>
          <Progress value={100} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem]">
            <span className="text-gray-900">Development</span>
            <span className="text-gray-600">65%</span>
          </div>
          <Progress value={65} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem]">
            <span className="text-gray-900">Testing</span>
            <span className="text-gray-600">30%</span>
          </div>
          <Progress value={30} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem]">
            <span className="text-gray-900">Deployment</span>
            <span className="text-gray-600">0%</span>
          </div>
          <Progress value={0} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example showing project task tracking with multiple phases at different completion levels.',
      },
    },
  },
};

/**
 * Animated progress bar simulating file upload.
 */
export const AnimatedUpload: Story = {
  tags: ['!dev'],
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            return 0;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    }, []);

    return (
      <div className="space-y-2 w-80">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Uploading File...</span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <p className="text-xs text-gray-500">Progress resets to 0% when complete</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing animated progress, simulating a file upload. The progress automatically resets when it reaches 100%.',
      },
    },
  },
};

/**
 * ### Checkpoint-Based Progress
 *
 * Progress bars using checkpoint-based calculation with weighted phases.
 *
 * Topics phase (5% weight) - Generating evaluation topics.
 */
export const CheckpointTopics: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2 w-96">
      <div className="flex justify-between text-[0.8125rem]">
        <span className="text-gray-900">Generating Topics</span>
        <span className="text-gray-600">3%</span>
      </div>
      <Progress value={3} />
      <p className="text-xs text-gray-500">Topics: 5% of total evaluation (currently at 60% of topics phase)</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress during topic generation phase. Topics contribute 5% to overall progress.',
      },
    },
  },
};

/**
 * Prompts phase (5% weight) - Generating test prompts.
 */
export const CheckpointPrompts: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2 w-96">
      <div className="flex justify-between text-[0.8125rem]">
        <span className="text-gray-900">Generating Prompts</span>
        <span className="text-gray-600">8%</span>
      </div>
      <Progress value={8} />
      <p className="text-xs text-gray-500">Topics complete (5%), Prompts: 5% of total (currently at 60% of prompts phase)</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress during prompt generation phase. Prompts contribute 5% to overall progress.',
      },
    },
  },
};

/**
 * Evaluation phase (85% weight) - Running evaluation on prompts.
 */
export const CheckpointEvaluation: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Running Evaluation (25% complete)</span>
          <span className="text-gray-600">31%</span>
        </div>
        <Progress value={31} />
        <p className="text-xs text-gray-500">Topics (5%) + Prompts (5%) + Evaluation (21% of 85%) = 31%</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Running Evaluation (50% complete)</span>
          <span className="text-gray-600">52%</span>
        </div>
        <Progress value={52} />
        <p className="text-xs text-gray-500">Topics (5%) + Prompts (5%) + Evaluation (42% of 85%) = 52%</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Running Evaluation (75% complete)</span>
          <span className="text-gray-600">74%</span>
        </div>
        <Progress value={74} />
        <p className="text-xs text-gray-500">Topics (5%) + Prompts (5%) + Evaluation (64% of 85%) = 74%</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress during evaluation phase. Evaluation contributes 85% to overall progress, making it the dominant phase.',
      },
    },
  },
};

/**
 * Summary phase (5% weight) - Structuring final summary.
 */
export const CheckpointSummary: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2 w-96">
      <div className="flex justify-between text-[0.8125rem]">
        <span className="text-gray-900">Structuring Summary</span>
        <span className="text-gray-600">97%</span>
      </div>
      <Progress value={97} />
      <p className="text-xs text-gray-500">Topics (5%) + Prompts (5%) + Evaluation (85%) + Summary (2% of 5%) = 97%</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress during summary structuring phase. Summary contributes final 5% to overall progress.',
      },
    },
  },
};

/**
 * Complete checkpoint flow from 0% to 100%.
 */
export const CheckpointFlow: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <h3 className="text-sm font-medium text-gray-900">Checkpoint-Based Progress Flow</h3>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[0.625rem]">
            <span className="text-gray-700">Topics Generated</span>
            <span className="text-gray-600 font-medium">5%</span>
          </div>
          <Progress value={5} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.625rem]">
            <span className="text-gray-700">Prompts Generated</span>
            <span className="text-gray-600 font-medium">10%</span>
          </div>
          <Progress value={10} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.625rem]">
            <span className="text-gray-700">Evaluation 25% (21/100 prompts)</span>
            <span className="text-gray-600 font-medium">31%</span>
          </div>
          <Progress value={31} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.625rem]">
            <span className="text-gray-700">Evaluation 50% (50/100 prompts)</span>
            <span className="text-gray-600 font-medium">52%</span>
          </div>
          <Progress value={52} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.625rem]">
            <span className="text-gray-700">Evaluation 100% (100/100 prompts)</span>
            <span className="text-gray-600 font-medium">95%</span>
          </div>
          <Progress value={95} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[0.625rem]">
            <span className="text-gray-700">Summary Complete</span>
            <span className="text-gray-600 font-medium">100%</span>
          </div>
          <Progress value={100} />
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-200">
        <p className="font-medium">Phase Weights:</p>
        <ul className="space-y-0.5 pl-3">
          <li>• Topics: 5%</li>
          <li>• Prompts: 5%</li>
          <li>• Evaluation: 85%</li>
          <li>• Summary: 5%</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete flow showing how progress is calculated across all checkpoints with their respective weights.',
      },
    },
  },
};

/**
 * Simulated data processing with slow incremental progress.
 */
export const SlowProgress: Story = {
  tags: ['!dev'],
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
      }, 100);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="space-y-2 w-80">
        <div className="flex justify-between text-[0.8125rem]">
          <span className="text-gray-900">Processing...</span>
          <span className="text-gray-600">{progress}%</span>
        </div>
        <Progress value={progress} />
        {progress === 100 && (
          <p className="text-xs text-green-600">Processing complete!</p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing steady incremental progress, useful for operations with predictable duration.',
      },
    },
  },
};

/**
 * Progress bar with custom styling for download tracking.
 */
export const DownloadProgress: Story = {
  tags: ['!dev'],
  render: () => {
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const startDownload = () => {
      setProgress(0);
      setIsDownloading(true);

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsDownloading(false);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
    };

    return (
      <div className="space-y-3 w-96">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Download File</h4>
          {!isDownloading && progress === 0 && (
            <button
              onClick={startDownload}
              className="px-3 py-1.5 text-xs font-medium text-gray-0 bg-gray-900 rounded hover:bg-gray-800 transition-colors"
            >
              Start Download
            </button>
          )}
          {progress === 100 && (
            <button
              onClick={startDownload}
              className="px-3 py-1.5 text-xs font-medium text-gray-0 bg-gray-900 rounded hover:bg-gray-800 transition-colors"
            >
              Download Again
            </button>
          )}
        </div>

        {(isDownloading || progress > 0) && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-[0.8125rem]">
                <span className="text-gray-900">
                  {isDownloading ? 'Downloading...' : 'Complete'}
                </span>
                <span className="text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {progress === 100 && (
              <p className="text-xs text-green-600">
                Download completed successfully!
              </p>
            )}
          </>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive download progress example with start button and completion message. Click "Start Download" to begin the simulated download.',
      },
    },
  },
};
