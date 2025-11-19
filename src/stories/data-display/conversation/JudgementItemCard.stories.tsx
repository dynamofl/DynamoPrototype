import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { JudgementItemCard } from '../../../features/ai-system-evaluation/components/results/conversation-view-components/judgement-item-card';
import type { JudgementListItem } from '../../../features/ai-system-evaluation/components/results/conversation-view-components/judgement-item-card';
import type { HoveredBehaviorContext } from '../../../components/patterns/ui-patterns/phrase-highlighter';
import { ExternalLink, ShieldAlert, FileText, CheckCircle, Shield } from 'lucide-react';

const meta: Meta<typeof JudgementItemCard> = {
  title: 'Data Display/Conversation/Judgement Item Card',
  component: JudgementItemCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Reusable card component for displaying judgement information with expandable details. Used in AI evaluation results to show guardrail violations, compliance issues, and other judgement-related information.`,
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
    // CONTENT
    children: {
      control: { type: 'text' },
      description: 'Main content slot - flexible for different card types',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Content',
      },
    },
    expandedItems: {
      control: { type: 'object' },
      description: 'Array of items to display when card is expanded',
      table: {
        type: { summary: 'JudgementListItem[]' },
        category: 'Content',
      },
    },
    expandedAction: {
      control: { type: 'object' },
      description: 'Optional action button displayed in expanded state',
      table: {
        type: { summary: '{ label: string, icon?: ReactNode, onClick: Function }' },
        category: 'Content',
      },
    },

    // APPEARANCE
    icon: {
      control: { type: 'text' },
      description: 'Optional icon displayed before the main content',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Appearance',
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
        category: 'Appearance',
      },
    },
    showExpandIcon: {
      control: { type: 'boolean' },
      description: 'Whether to show expand/collapse icon',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
        category: 'Appearance',
      },
    },

    // STATE
    expandable: {
      control: { type: 'boolean' },
      description: 'Whether the card can be expanded',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    isExpanded: {
      control: { type: 'boolean' },
      description: 'Current expansion state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    isAnnotationMode: {
      control: { type: 'boolean' },
      description: 'Whether card is in annotation mode (affects styling)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    hoveredBehavior: {
      control: { type: 'object' },
      description: 'Currently hovered behavior context',
      table: {
        type: { summary: 'HoveredBehaviorContext | null' },
        category: 'State',
      },
    },
    selectedBehaviors: {
      control: { type: 'object' },
      description: 'Set of selected behavior IDs',
      table: {
        type: { summary: 'Set<string> | null' },
        category: 'State',
      },
    },

    // EVENTS
    onToggle: {
      action: 'toggled',
      description: 'Callback when card is toggled',
      table: {
        type: { summary: '() => void' },
        category: 'Events',
      },
    },
    onMainClick: {
      action: 'main-clicked',
      description: 'Callback when main card area is clicked',
      table: {
        type: { summary: '() => void' },
        category: 'Events',
      },
    },
    onItemHover: {
      action: 'item-hovered',
      description: 'Callback when an expanded item is hovered',
      table: {
        type: { summary: '(behavior: HoveredBehaviorContext | null) => void' },
        category: 'Events',
      },
    },
    onItemClick: {
      action: 'item-clicked',
      description: 'Callback when an expanded item is clicked',
      table: {
        type: { summary: '(behavior: HoveredBehaviorContext) => void' },
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for expanded items
const mockViolationItems: JudgementListItem[] = [
  {
    id: '1',
    text: 'Requesting sensitive authentication data',
    behavior: 'auth-data-request',
    guardrailName: 'Data Privacy Guardrail',
  },
  {
    id: '2',
    text: 'Attempting to bypass security protocols',
    behavior: 'security-bypass',
    guardrailName: 'Data Privacy Guardrail',
  },
  {
    id: '3',
    text: 'Privacy violation through direct data access',
    behavior: 'privacy-violation',
    guardrailName: 'Data Privacy Guardrail',
  },
];

const mockComplianceItems: JudgementListItem[] = [
  {
    id: '1',
    text: 'GDPR Article 5 - Lawfulness of processing',
    behavior: 'gdpr-5',
    guardrailName: 'Compliance Guardrail',
  },
  {
    id: '2',
    text: 'CCPA Section 1798.100 - Consumer rights',
    behavior: 'ccpa-1798',
    guardrailName: 'Compliance Guardrail',
  },
];


/**
 * ### Examples
 *
 * Real-world usage patterns.
 *
 * Interactive card with controlled expansion state.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredBehavior, setHoveredBehavior] = useState<HoveredBehaviorContext | null>(null);
    const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string> | null>(null);

    const handleItemClick = (behavior: HoveredBehaviorContext) => {
      const behaviorId = behavior.behavior;
      setSelectedBehaviors((prev) => {
        const newSet = new Set(prev || []);
        if (newSet.has(behaviorId)) {
          newSet.delete(behaviorId);
        } else {
          newSet.add(behaviorId);
        }
        return newSet.size > 0 ? newSet : null;
      });
    };

    return (
      <div className="w-[360px]">
        <JudgementItemCard
          icon={
            <div className="p-1.5 bg-red-50 rounded-full">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
          }
          expandable
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          expandedItems={mockViolationItems}
          hoveredBehavior={hoveredBehavior}
          selectedBehaviors={selectedBehaviors}
          onItemHover={setHoveredBehavior}
          onItemClick={handleItemClick}
          expandedAction={{
            label: 'View Full Report',
            icon: <ExternalLink className="w-3 h-3 ml-0.5" />,
            onClick: (e) => {
              e.stopPropagation();
              alert('Opening full report...');
            },
          }}
          className="py-2"
        >
          <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
            <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
            <div className="text-xs font-400 leading-4 text-gray-600">
              Blocked • {mockViolationItems.length} violations detected
            </div>
          </div>
        </JudgementItemCard>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive card demonstrating expansion, hover states, item selection, and action button functionality. Click the card to toggle expansion, hover over items to see hover effects, and click items to select/deselect them.',
      },
    },
  },
};

/**
 * ### Basic Variants
 *
 * Simple card layouts without expansion.
 *
 * Basic non-expandable card with custom content.
 */
export const Simple: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-red-50 rounded-full">
        <ShieldAlert className="w-4 h-4 text-red-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
        <div className="text-xs font-400 leading-4 text-gray-600">Detected 3 violations</div>
      </div>
    ),
    expandable: false,
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Non-expandable card in annotation mode with enhanced shadow.
 */
export const AnnotationMode: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-green-50 rounded-full">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Compliance Check</div>
        <div className="text-xs font-400 leading-4 text-gray-600">All regulations passed</div>
      </div>
    ),
    expandable: false,
    isAnnotationMode: true,
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * ### Expandable Variants
 *
 * Cards with collapsible content sections.
 *
 * Expandable card in collapsed state.
 */
export const Collapsed: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-red-50 rounded-full">
        <ShieldAlert className="w-4 h-4 text-red-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
        <div className="text-xs font-400 leading-4 text-gray-600">3 violations detected</div>
      </div>
    ),
    expandable: true,
    isExpanded: false,
    expandedItems: mockViolationItems,
    showExpandIcon: true,
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Expandable card in expanded state showing violation items.
 */
export const Expanded: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-red-50 rounded-full">
        <ShieldAlert className="w-4 h-4 text-red-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
        <div className="text-xs font-400 leading-4 text-gray-600">3 violations detected</div>
      </div>
    ),
    expandable: true,
    isExpanded: true,
    expandedItems: mockViolationItems,
    showExpandIcon: true,
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Expanded card with action button for additional interactions.
 */
export const ExpandedWithAction: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-amber-50 rounded-full">
        <FileText className="w-4 h-4 text-amber-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Compliance Guardrail</div>
        <div className="text-xs font-400 leading-4 text-gray-600">2 regulations referenced</div>
      </div>
    ),
    expandable: true,
    isExpanded: true,
    expandedItems: mockComplianceItems,
    showExpandIcon: true,
    expandedAction: {
      label: 'View Details',
      icon: <ExternalLink className="w-3 h-3 ml-0.5" />,
      onClick: (e) => {
        e.stopPropagation();
        console.log('View details clicked');
      },
    },
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * ### Interactive States
 *
 * Cards with hover and selection interactions.
 *
 * Card with a hovered behavior item highlighted.
 */
export const ItemHovered: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-red-50 rounded-full">
        <ShieldAlert className="w-4 h-4 text-red-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
        <div className="text-xs font-400 leading-4 text-gray-600">3 violations detected</div>
      </div>
    ),
    expandable: true,
    isExpanded: true,
    expandedItems: mockViolationItems,
    hoveredBehavior: {
      behavior: 'security-bypass',
      guardrailName: 'Data Privacy Guardrail',
    },
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Card with selected behavior items.
 */
export const ItemSelected: Story = {
  tags: ['!dev'],
  args: {
    icon: (
      <div className="p-1.5 bg-red-50 rounded-full">
        <ShieldAlert className="w-4 h-4 text-red-600" />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
        <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
        <div className="text-xs font-400 leading-4 text-gray-600">3 violations detected</div>
      </div>
    ),
    expandable: true,
    isExpanded: true,
    expandedItems: mockViolationItems,
    selectedBehaviors: new Set(['auth-data-request', 'privacy-violation']),
    className: 'py-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};



/**
 * Complete evaluation flow showing multiple judgement cards.
 */
export const MultipleExample: Story = {
  tags: ['!dev'],
  render: () => {
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [hoveredBehavior, setHoveredBehavior] = useState<HoveredBehaviorContext | null>(null);
    const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string> | null>(null);

    const toggleCard = (cardId: string) => {
      setExpandedCards((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(cardId)) {
          newSet.delete(cardId);
        } else {
          newSet.add(cardId);
        }
        return newSet;
      });
    };

    const handleItemClick = (behavior: HoveredBehaviorContext) => {
      const behaviorId = behavior.behavior;
      setSelectedBehaviors((prev) => {
        const newSet = new Set(prev || []);
        if (newSet.has(behaviorId)) {
          newSet.delete(behaviorId);
        } else {
          newSet.add(behaviorId);
        }
        return newSet.size > 0 ? newSet : null;
      });
    };

    return (
      <div className="space-y-2 w-[360px]">
        <JudgementItemCard
          icon={
            <div className="p-1.5 bg-red-50 rounded-full">
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
          }
          expandable
          isExpanded={expandedCards.has('privacy')}
          onToggle={() => toggleCard('privacy')}
          expandedItems={mockViolationItems}
          hoveredBehavior={hoveredBehavior}
          selectedBehaviors={selectedBehaviors}
          onItemHover={setHoveredBehavior}
          onItemClick={handleItemClick}
          className="py-2"
        >
          <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
            <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Data Privacy Guardrail</div>
            <div className="text-xs font-400 leading-4 text-gray-600">3 violations detected</div>
          </div>
        </JudgementItemCard>

        <JudgementItemCard
          icon={
            <div className="p-1.5 bg-amber-50 rounded-full">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
          }
          expandable
          isExpanded={expandedCards.has('compliance')}
          onToggle={() => toggleCard('compliance')}
          expandedItems={mockComplianceItems}
          hoveredBehavior={hoveredBehavior}
          selectedBehaviors={selectedBehaviors}
          onItemHover={setHoveredBehavior}
          onItemClick={handleItemClick}
          expandedAction={{
            label: 'Learn More',
            icon: <ExternalLink className="w-3 h-3 ml-0.5" />,
            onClick: (e) => {
              e.stopPropagation();
              alert('Opening compliance documentation...');
            },
          }}
          className="py-2"
        >
          <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
            <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Compliance Guardrail</div>
            <div className="text-xs font-400 leading-4 text-gray-600">2 regulations referenced</div>
          </div>
        </JudgementItemCard>

        <JudgementItemCard
          icon={
            <div className="p-1.5 bg-green-50 rounded-full">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
          }
          isAnnotationMode
          className="py-2"
        >
          <div className="flex flex-col gap-1 items-start justify-center w-full px-1">
            <div className="text-[0.875rem] font-450 leading-5 text-gray-900">Security Guardrail</div>
            <div className="text-xs font-400 leading-4 text-green-600">✓ All checks passed</div>
          </div>
        </JudgementItemCard>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete AI evaluation flow showing multiple judgement cards for different guardrails. Demonstrates privacy violations, compliance issues, and passed security checks. Hover and selection states are synchronized across all cards.',
      },
    },
  },
};
