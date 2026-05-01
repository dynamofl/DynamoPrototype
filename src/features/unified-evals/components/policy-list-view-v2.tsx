import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Languages,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PolicyTemplate } from "@/v2/features/projects/components/policies/types";

interface PolicyListViewV2Props {
  templates: PolicyTemplate[];
  selectedIds: Set<string>;
  hoveredTemplateId: string | null;
  previewTemplateId: string | null;
  onToggle: (templateId: string) => void;
  onHover: (template: PolicyTemplate | null) => void;
  onTogglePreview: (template: PolicyTemplate) => void;
  animateOnMount?: boolean;
}

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
};

export function PolicyListViewV2({
  templates,
  selectedIds,
  hoveredTemplateId,
  previewTemplateId,
  onToggle,
  onHover,
  onTogglePreview,
  animateOnMount = true,
}: PolicyListViewV2Props) {
  const [hasMounted, setHasMounted] = useState(!animateOnMount);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (templates.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No Matching Templates
      </p>
    );
  }

  return (
    <motion.div className="divide-y divide-gray-100" variants={listVariants}>
      {templates.map((template) => {
        const selected = selectedIds.has(template.id);
        const isHovered = hoveredTemplateId === template.id;
        const isPreviewing = previewTemplateId === template.id;
        const showActionButton = isPreviewing || isHovered;
        return (
          <motion.div
            key={template.id}
            variants={rowVariants}
            initial={hasMounted ? false : undefined}
            onMouseEnter={() => onHover(template)}
            className={cn(
              "flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-default border-none",
              isPreviewing ? "bg-gray-50" : isHovered ? "bg-gray-50" : "",
            )}
          >
            <div className="py-1">
              <button
                onClick={() => onToggle(template.id)}
                className={cn(
                  "h-4 w-4 rounded border-[1.5px] shrink-0 flex items-center justify-center transition-colors",
                  selected
                    ? "bg-gray-900 border-gray-900"
                    : "border-gray-300 hover:border-gray-400",
                )}
              >
                {selected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={() => onToggle(template.id)}
              className="flex-1 text-left min-w-0"
            >
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-[450] truncate",
                    selected ? "text-gray-900" : "text-gray-900",
                  )}
                >
                  {template.name}
                </span>
              </div>
              <p
                className={cn(
                  "text-xs text-gray-700 line-clamp-1 pt-1",
                  selected ? "text-gray-900" : "text-gray-900",
                )}
              >
                {template.description}
              </p>
              <PolicyMetaRow />
            </button>

            {showActionButton && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePreview(template);
                }}
              >
                {isPreviewing ? (
                  <>
                    Hide Preview
                    <ChevronLeft className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Preview
                    <ChevronRight className="h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function PolicyMetaRow() {
  return (
    <div className="mt-1.5 truncate text-xs text-gray-500">
      <span className="inline-flex items-center gap-1 align-middle">
        <Languages className="h-3 w-3" />
        EN
      </span>
      <span className="mx-1 align-middle">•</span>
      <span className="inline-flex items-center gap-1 align-middle">
        <MessageSquare className="h-3 w-3" />
        327 Eval Prompts
      </span>
      <span className="mx-1 align-middle ">•</span>
      <span className="inline-flex items-center gap-1 align-middle">
        {/* <Info className="h-3 w-3" /> */}
        johndoe@xyz.com
      </span>
      <span className="mx-1 align-middle">•</span>
      <span className="align-middle">10 Apr, 2026</span>
    </div>
  );
}
