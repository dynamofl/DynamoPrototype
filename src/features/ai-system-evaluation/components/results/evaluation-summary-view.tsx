import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { BaseEvaluationSummary, BaseEvaluationResult } from "../../types/base-evaluation";
import type { EvaluationStrategy } from "../../strategies/base-strategy";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";
import { SummaryViewRenderer } from "./summary/summary-view-renderer";
import { SummaryNavigation, type NavigationSection } from "./summary/summary-navigation";
import { Badge } from "@/components/ui/badge";
import { ChatComposer } from "./summary/chat-composer";

interface EvaluationSummaryViewProps {
  summary: BaseEvaluationSummary;
  strategy: EvaluationStrategy;
  testType: string;
  hasGuardrails?: boolean;  // NEW: Whether evaluation has guardrails configured
  aiSystemName?: string;
  aiSystemIcon?:
    | "OpenAI"
    | "Azure"
    | "Mistral"
    | "Databricks"
    | "HuggingFace"
    | "Anthropic"
    | "Remote"
    | "Local"
    | "AWS"
    | "DynamoAI";
  timestamp: string;
  startedAt?: string;
  completedAt?: string;
  evaluationName?: string;
  evaluationId?: string;
  tokenUtilization?: number;
  topicAnalysis?: any; // Topic analysis with AI insights
  evaluationResults?: BaseEvaluationResult[]; // Evaluation prompts for behavior extraction
  config?: any; // Evaluation config with full policy definitions
}

export function EvaluationSummaryView({
  summary,
  strategy,
  testType,
  hasGuardrails = false,
  aiSystemName,
  aiSystemIcon,
  timestamp,
  startedAt,
  completedAt,
  evaluationName,
  evaluationId,
  tokenUtilization,
  topicAnalysis,
  evaluationResults,
  config,
}: EvaluationSummaryViewProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const isScrollingProgrammatically = useRef(false);

  // Format timestamp
  const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate duration
  let formattedDuration = "--";
  if (startedAt && completedAt) {
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    formattedDuration = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  // Build navigation sections from strategy config
  const viewConfig = strategy.getSummaryViewConfig();
  const context = { summary, testType, hasGuardrails, topicAnalysis, evaluationResults, config };

  const navigationSections: NavigationSection[] = viewConfig
    .filter(section => section.label) // Only show sections with labels
    .map(section => ({
      key: section.key,
      label: section.label!,
      visible: section.condition ? section.condition(context) : true
    }));

  // Handle section navigation
  const handleSectionClick = (sectionKey: string) => {
    setActiveSection(sectionKey);

    // Set flag to prevent scroll listener from interfering
    isScrollingProgrammatically.current = true;

    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Reset flag after scroll animation completes (smooth scroll takes ~500-1000ms)
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Don't update active section during programmatic scrolling
      if (isScrollingProgrammatically.current) {
        return;
      }

      const sections = navigationSections.filter(s => s.visible);

      // Check each section and find which one is currently in view
      let foundActive = false;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const element = document.getElementById(`section-${section.key}`);

        if (element) {
          const rect = element.getBoundingClientRect();

          // Check if this section is in the viewport (considering some offset from top)
          // A section is active if its top is above or at the middle of viewport
          // and its bottom is below the middle
          if (rect.top <= 200 && rect.bottom > 200) {
            setActiveSection(section.key);
            foundActive = true;
            break;
          }
        }
      }

      // If no section is found (e.g., at the very top or bottom),
      // default to the first visible section
      if (!foundActive && sections.length > 0) {
        setActiveSection(sections[0].key);
      }
    };

    // Call once on mount to set initial active section
    handleScroll();

    // Listen to scroll on both window and potential scroll containers
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [navigationSections]);

  return (
    <div

      className="relative w-full py-6"
    >
      {/* Left Sidebar Navigation - Fixed Position */}
      <motion.div  initial={{ opacity: 0,scale: 0.95 }}
      animate={{ opacity: 1,scale: 1 }}
      exit={{ opacity: 0,scale: 0.95 }} className="fixed left-16 top-32 z-10">
        <SummaryNavigation
          sections={navigationSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
        />
      </motion.div>

      {/* Main Content - Centered */}
      <motion.div  initial={{ opacity: 0,scale: 0.99 }}
      animate={{ opacity: 1,scale: 1 }}
      exit={{ opacity: 0,scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeInOut" }} className="max-w-3xl mx-auto space-y-4 items-start">
        {/* AI System Header */}
        <div id="section-overview" className="space-y-2 mx-3 pb-2">
          <div className="flex items-center gap-1 -mx-1">
            {aiSystemIcon && (
              <AISystemIcon type={aiSystemIcon} className="w-6 h-6" />
            )}
            <h1 className="text-[0.8125rem] font-450 text-gray-600">
              {aiSystemName || "AI System"}
            </h1>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl font-450 text-gray-900">
            {evaluationName || "--"}
          </h2>

           {/* Metadata Section */}
        <div className="flex flex-wrap text-[0.8125rem] font-400 gap-1">

            <span className="text-gray-400">{strategy.displayName} Evaluation</span>
            <span className="text-gray-400">• Runtime: {formattedDuration}</span>
            <span className="text-gray-400">• Evaluated On:  {formattedDate}, {formattedTime}</span>

        </div>
        </div>



        {/* Config-driven summary view rendering */}
        <SummaryViewRenderer
          strategy={strategy}
          summary={summary}
          testType={testType}
          hasGuardrails={hasGuardrails}
          topicAnalysis={topicAnalysis}
          evaluationResults={evaluationResults}
          config={config}
        />

        {/* Chat Composer at bottom */}
        <div className="mt-12 mb-8">
          <ChatComposer evaluationId={evaluationId} evaluationType={testType} />
        </div>
      </motion.div>
    </div>
  )
}
