# Summary Template Components

## Overview

This directory contains reusable template components for displaying structured data in the evaluation summary. These components provide consistent styling and behavior across both Jailbreak and Compliance evaluations.

### Purpose
- Provide plug-and-play components with consistent look and feel
- Support flexible data structures for various use cases
- Maintain styling consistency with existing summary sections
- Enable easy integration with the component registry system

## Component List

### Main Template Components
1. **SummaryTextSection** - Simple title + description layout
2. **SummaryTableSection** - Structured data tables with title and description
3. **SummaryChartSection** - Visual data representation with charts

### Chart Components
4. **BarChartComponent** - Bar chart visualization
5. **LineChartComponent** - Line chart visualization
6. **AreaChartComponent** - Area chart visualization
7. **PieChartComponent** - Pie chart visualization
8. **RadialChartComponent** - Radial chart visualization
9. **RadarChartComponent** - Radar chart visualization

---

## File Structure

```
templates/
├── TEMPLATES.md                      # This documentation file
├── index.ts                          # Export all templates
├── types.ts                          # Shared TypeScript interfaces
│
├── summary-text-section.tsx          # Text-only template
├── summary-table-section.tsx         # Table template
├── summary-chart-section.tsx         # Chart wrapper component
│
├── bar-chart-component.tsx           # Bar chart
├── line-chart-component.tsx          # Line chart
├── area-chart-component.tsx          # Area chart
├── pie-chart-component.tsx           # Pie chart
├── radial-chart-component.tsx        # Radial chart
└── radar-chart-component.tsx         # Radar chart
```

---

## Component Specifications

### 1. SummaryTextSection

**Purpose:** Display text content with optional title and description.

**Use Cases:**
- Executive summaries
- Key findings
- Methodology explanations
- Disclaimers or notes

**Props Interface:**
```typescript
interface SummaryTextSectionProps {
  title: string;                           // Section title (Title Case)
  description?: string;                    // Main text content
  topDescription?: string;                 // Optional description above content
  bottomDescription?: string;              // Optional description below content
  className?: string;                      // Additional CSS classes
}
```

**Layout Structure:**
```
┌─────────────────────────────────┐
│ Title (font-550, text-gray-900) │
├─────────────────────────────────┤
│ Top Description (optional)      │
│ (font-[425], text-gray-600)     │
├─────────────────────────────────┤
│ Main Content Area               │
├─────────────────────────────────┤
│ Bottom Description (optional)   │
│ (font-[425], text-gray-600)     │
└─────────────────────────────────┘
```

---

### 2. SummaryTableSection

**Purpose:** Display tabular data with flexible column and row configuration.

**Use Cases:**
- Performance metrics
- Comparison tables
- Statistical summaries
- Breakdown by category

**Props Interface:**
```typescript
interface Column {
  key: string;                             // Unique column identifier
  header: string;                          // Column header text (Title Case)
  align?: 'left' | 'right' | 'center';     // Text alignment (default: left)
  width?: string;                          // Optional fixed width (e.g., "120px")
  render?: (value: any, row: any) => React.ReactNode; // Custom cell renderer
}

interface SummaryTableSectionProps {
  title: string;                           // Section title (Title Case)
  columns: Column[];                       // Table column configuration
  data: any[];                             // Table data rows
  topDescription?: string;                 // Optional description above table
  bottomDescription?: string;              // Optional description below table
  className?: string;                      // Additional CSS classes
}
```

**Layout Structure:**
```
┌─────────────────────────────────┐
│ Title (font-550, text-gray-900) │
├─────────────────────────────────┤
│ Top Description (optional)      │
├─────────────────────────────────┤
│ ┌──────────┬─────────┬────────┐│
│ │ Header 1 │ Header 2│ Header3││
│ ├──────────┼─────────┼────────┤│
│ │ Data 1.1 │ Data 1.2│Data 1.3││
│ │ Data 2.1 │ Data 2.2│Data 2.3││
│ └──────────┴─────────┴────────┘│
├─────────────────────────────────┤
│ Bottom Description (optional)   │
└─────────────────────────────────┘
```

**Table Styling:**
- Header row: `bg-gray-100`, `font-450`
- Data rows: `text-gray-900`, `font-450` for values
- Fixed width columns for numeric data (right-aligned)
- Responsive design with proper spacing

---

### 3. SummaryChartSection

**Purpose:** Display data visualizations with multiple chart type support.

**Use Cases:**
- Trend analysis
- Distribution visualization
- Performance over time
- Category comparisons

**Props Interface:**
```typescript
type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radial' | 'radar';

interface SummaryChartSectionProps {
  title: string;                           // Section title (Title Case)
  chartType: ChartType;                    // Type of chart to render
  data: any[];                             // Chart data
  chartConfig: ChartConfig;                // Chart configuration (colors, labels)
  topDescription?: string;                 // Optional description above chart
  bottomDescription?: string;              // Optional description below chart (default)
  height?: string;                         // Chart height (default: "210px")
  className?: string;                      // Additional CSS classes
}
```

**Layout Structure:**
```
┌─────────────────────────────────┐
│ Title (font-550, text-gray-900) │
├─────────────────────────────────┤
│ Top Description (optional)      │
├─────────────────────────────────┤
│ ┌───────────────────────────┐  │
│ │                           │  │
│ │      Chart Area           │  │
│ │      (h-[210px])          │  │
│ │                           │  │
│ └───────────────────────────┘  │
├─────────────────────────────────┤
│ Bottom Description (default)    │
└─────────────────────────────────┘
```

---

## TypeScript Interfaces

### Core Types (types.ts)

```typescript
// Base section props
export interface BaseSectionProps {
  title: string;
  topDescription?: string;
  bottomDescription?: string;
  className?: string;
}

// Text section
export interface SummaryTextSectionProps extends BaseSectionProps {
  description?: string;
}

// Table section
export interface Column {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SummaryTableSectionProps extends BaseSectionProps {
  columns: Column[];
  data: any[];
}

// Chart section
export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radial' | 'radar';

export interface SummaryChartSectionProps extends BaseSectionProps {
  chartType: ChartType;
  data: any[];
  chartConfig: ChartConfig;
  height?: string;
}

// Individual chart component props
export interface ChartComponentProps {
  data: any[];
  chartConfig: ChartConfig;
  height?: string;
  className?: string;
}
```

---

## Styling Guidelines

### Container & Layout
- **Max width:** `max-w-4xl mx-auto`
- **Section spacing:** `space-y-4`
- **Section margins:** `my-4` or `my-8`
- **Content padding:** `px-3`, `py-4`
- **Border radius:** `rounded-xl` for containers

### Typography
- **Section titles:** `text-sm font-550 leading-4 text-gray-900` (Title Case)
- **Descriptions:** `text-sm font-[425] leading-5 text-gray-600 leading-relaxed`
- **Table headers:** `text-sm font-450 text-gray-900`
- **Table data:** `text-sm font-450 text-gray-900`

### Colors (Tailwind Only)

**Allowed color palettes:** gray, red, green, amber

**Background colors:**
- Use `bg-gray-0` instead of `bg-white`
- Container backgrounds: `bg-gray-50`
- Table headers: `bg-gray-100`
- Borders: `border-gray-200`

**Text colors:**
- Primary: `text-gray-900`
- Secondary: `text-gray-600`
- Success: `text-green-600`, `text-green-700`
- Error: `text-red-600`, `text-red-700`
- Warning: `text-amber-600`, `text-amber-700`

**Chart Colors (CSS Variables):**

Charts MUST use only the predefined chart color variables from `index.css`:

```css
/* Light theme */
--chart-1: oklch(0.85 0.05 260);  /* Very light blue */
--chart-2: oklch(0.75 0.08 260);
--chart-3: oklch(0.60 0.10 260);
--chart-4: oklch(0.45 0.12 260);
--chart-5: oklch(0.30 0.15 260);

/* Dark theme (auto-adjusts) */
--chart-1: oklch(0.60 0.05 260);
--chart-2: oklch(0.50 0.08 260);
--chart-3: oklch(0.40 0.10 260);
--chart-4: oklch(0.28 0.12 260);
--chart-5: oklch(0.18 0.15 260);
```

**Usage in charts:**
```typescript
const chartConfig = {
  metric1: {
    label: "Metric 1",
    color: "var(--chart-1)",  // Use CSS variable
  },
  metric2: {
    label: "Metric 2",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
```

### Spacing
- **Between title and content:** `space-y-3`
- **Between description paragraphs:** `space-y-2`
- **Between table rows:** Default table spacing
- **Chart margins:** `{ left: 4, right: 12, top: 8, bottom: 8 }`

---

## Chart Component Details

### Common Chart Props
All chart components accept:
```typescript
interface ChartComponentProps {
  data: any[];              // Chart data
  chartConfig: ChartConfig; // Configuration with colors and labels
  height?: string;          // Height (default: "210px")
  className?: string;       // Additional styles
}
```

### Chart Type Details

#### 1. BarChartComponent
- **Best for:** Category comparisons, discrete data
- **Data format:** `[{ category: string, value: number }, ...]`
- **Styling:** Vertical bars with cartesian grid
- **Colors:** Use `var(--chart-1)` to `var(--chart-5)`

#### 2. LineChartComponent
- **Best for:** Trends over time, continuous data
- **Data format:** `[{ x: string|number, y: number }, ...]`
- **Styling:** Line with `strokeWidth={2}`, dots at data points
- **Colors:** Use `var(--chart-1)` to `var(--chart-5)`

#### 3. AreaChartComponent
- **Best for:** Trends with emphasis on volume
- **Data format:** `[{ x: string|number, y: number }, ...]`
- **Styling:** Filled area under line
- **Colors:** Use `var(--chart-1)` with opacity

#### 4. PieChartComponent
- **Best for:** Part-to-whole relationships, proportions
- **Data format:** `[{ name: string, value: number }, ...]`
- **Styling:** Circular segments with labels
- **Colors:** Use `var(--chart-1)` to `var(--chart-5)` for segments

#### 5. RadialChartComponent
- **Best for:** Cyclical data, progress indicators
- **Data format:** `[{ category: string, value: number }, ...]`
- **Styling:** Circular bars
- **Colors:** Use `var(--chart-1)` to `var(--chart-5)`

#### 6. RadarChartComponent
- **Best for:** Multi-dimensional comparisons
- **Data format:** `[{ metric: string, value: number }, ...]`
- **Styling:** Web/spider chart
- **Colors:** Use `var(--chart-1)` to `var(--chart-5)`

---

## Mock Data Examples

### Text Section
```typescript
const textExample = {
  title: "Executive Summary",
  description: "This evaluation assesses the system's performance across multiple attack vectors and compliance scenarios. Results indicate strong defensive capabilities with targeted areas for improvement."
};
```

### Table Section
```typescript
const tableExample = {
  title: "Performance Metrics",
  columns: [
    { key: 'metric', header: 'Metric', align: 'left' },
    { key: 'value', header: 'Value', align: 'right', width: '100px' },
    { key: 'status', header: 'Status', align: 'center', width: '120px' }
  ],
  data: [
    { metric: 'Total Tests', value: '1,247', status: 'Completed' },
    { metric: 'Success Rate', value: '94.3%', status: 'Good' },
    { metric: 'Average Response Time', value: '234ms', status: 'Excellent' }
  ],
  bottomDescription: "All metrics measured over 30-day evaluation period."
};
```

### Chart Section (Bar)
```typescript
const barChartExample = {
  title: "Attack Type Performance",
  chartType: 'bar' as const,
  data: [
    { category: 'Direct Attacks', value: 87 },
    { category: 'Obfuscation', value: 92 },
    { category: 'Context Manipulation', value: 78 },
    { category: 'Role Play', value: 85 }
  ],
  chartConfig: {
    value: {
      label: "Success Rate (%)",
      color: "var(--chart-1)",
    }
  } satisfies ChartConfig,
  bottomDescription: "Success rates by attack type over evaluation period."
};
```

### Chart Section (Line)
```typescript
const lineChartExample = {
  title: "Trend Analysis",
  chartType: 'line' as const,
  data: [
    { week: 'Week 1', score: 78 },
    { week: 'Week 2', score: 82 },
    { week: 'Week 3', score: 85 },
    { week: 'Week 4', score: 88 }
  ],
  chartConfig: {
    score: {
      label: "Performance Score",
      color: "var(--chart-2)",
    }
  } satisfies ChartConfig,
  bottomDescription: "Weekly performance trends showing steady improvement."
};
```

### Chart Section (Pie)
```typescript
const pieChartExample = {
  title: "Result Distribution",
  chartType: 'pie' as const,
  data: [
    { name: 'Passed', value: 847 },
    { name: 'Failed', value: 156 },
    { name: 'Uncertain', value: 244 }
  ],
  chartConfig: {
    Passed: { label: "Passed", color: "var(--chart-1)" },
    Failed: { label: "Failed", color: "var(--chart-3)" },
    Uncertain: { label: "Uncertain", color: "var(--chart-4)" }
  } satisfies ChartConfig,
  bottomDescription: "Overall test result distribution."
};
```

---

## Usage Examples

### Basic Text Section
```typescript
import { SummaryTextSection } from './templates';

<SummaryTextSection
  title="Key Findings"
  description="The evaluation identified several critical patterns in system behavior..."
/>
```

### Table with Custom Rendering
```typescript
import { SummaryTableSection } from './templates';

<SummaryTableSection
  title="Performance Metrics"
  columns={[
    { key: 'name', header: 'Metric Name', align: 'left' },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: (value) => <span className="font-550">{value}</span>
    }
  ]}
  data={metricsData}
  bottomDescription="Measured over 30-day period."
/>
```

### Chart Section with Bar Chart
```typescript
import { SummaryChartSection } from './templates';

<SummaryChartSection
  title="Attack Success Rates"
  chartType="bar"
  data={attackData}
  chartConfig={{
    successRate: {
      label: "Success Rate (%)",
      color: "var(--chart-1)",
    }
  }}
  bottomDescription="Success rates by attack category."
/>
```

### Stacked Usage
```typescript
<>
  <SummaryTextSection
    title="Overview"
    description="Executive summary of findings..."
  />

  <SummaryTableSection
    title="Key Metrics"
    columns={columns}
    data={tableData}
  />

  <SummaryChartSection
    title="Performance Trends"
    chartType="line"
    data={trendData}
    chartConfig={lineConfig}
  />
</>
```

---

## Integration with Component Registry

To add these templates to the component registry:

```typescript
// In component-registry.tsx
import {
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection
} from './templates';

export const componentRegistry = {
  // Existing components...

  // Template components
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection,
} as const;
```

### Using in View Configuration
```typescript
// In strategy configuration
{
  key: 'custom-analysis',
  component: 'SummaryTextSection',
  props: {
    title: "Custom Analysis",
    description: "Analysis content..."
  },
  order: 50
}
```

---

## Customization Options

### Description Placement

**Default:** Description appears below content
```typescript
<SummaryChartSection
  title="Performance"
  bottomDescription="This is the default position."
  {...props}
/>
```

**Top placement:**
```typescript
<SummaryChartSection
  title="Performance"
  topDescription="Description appears above the chart."
  {...props}
/>
```

**Both positions:**
```typescript
<SummaryChartSection
  title="Performance"
  topDescription="Introductory context..."
  bottomDescription="Additional notes and interpretations."
  {...props}
/>
```

### Custom Styling
```typescript
<SummaryTextSection
  title="Custom Section"
  className="my-8 border-l-4 border-blue-500 pl-4"
  description="Custom styled section..."
/>
```

---

## Best Practices

### 1. Title Case
Always use Title Case for section titles and column headers:
- ✅ "Attack Type Performance"
- ❌ "attack type performance"

### 2. Chart Colors
Always use chart color variables, never hardcode colors:
- ✅ `color: "var(--chart-1)"`
- ❌ `color: "#3b82f6"`

### 3. Description Length
Keep descriptions concise and focused:
- 1-3 sentences for top descriptions
- 2-4 sentences for bottom descriptions
- Use bullet points for multiple key points

### 4. Table Design
- Use fixed widths for numeric columns
- Right-align numeric data
- Left-align text data
- Limit columns to 3-5 for readability

### 5. Chart Selection
Choose appropriate chart types:
- **Bar:** Comparing categories
- **Line:** Showing trends over time
- **Area:** Emphasizing magnitude of change
- **Pie:** Showing proportions (limit to 5-7 segments)
- **Radial:** Circular/cyclical data
- **Radar:** Multi-dimensional comparisons

### 6. Responsive Design
All components are responsive by default:
- Tables scroll horizontally on small screens
- Charts maintain aspect ratio
- Text wraps appropriately

---

## Implementation Checklist

When implementing these components:

- [ ] Create types.ts with all interfaces
- [ ] Implement SummaryTextSection with mock data
- [ ] Implement SummaryTableSection with mock data
- [ ] Implement SummaryChartSection wrapper
- [ ] Implement all 6 chart components
- [ ] Use only var(--chart-X) colors in charts
- [ ] Test with mock data
- [ ] Verify responsive behavior
- [ ] Check dark mode compatibility
- [ ] Add to component registry (if needed)
- [ ] Create index.ts exports

---

## Future Enhancements

Potential future additions:
- Expandable table rows
- Sortable columns
- Interactive chart tooltips (already included)
- Export functionality
- Print-friendly layouts
- Additional chart types (scatter, heatmap)
- Tabbed content support

---

## Questions or Issues?

For questions about these templates or to report issues, please refer to the main evaluation system documentation or contact the development team.
