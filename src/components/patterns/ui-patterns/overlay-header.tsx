import { Button } from "@/components/ui/button";
import { X, Minus, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

export interface TitleDropdownOption {
  id: string;
  label: string;
  isActive?: boolean;
}

interface OverlayHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbSegment[]; // e.g., ["GPT-4", "Security Evaluation"]
  titleDropdownOptions?: TitleDropdownOption[]; // Dropdown options for switching evaluations
  onTitleDropdownSelect?: (optionId: string) => void;
  onClose?: () => void;
  onMinimize?: () => void;
  actions?: ReactNode;
}

export function OverlayHeader({
  title,
  subtitle,
  breadcrumbs,
  titleDropdownOptions,
  onTitleDropdownSelect,
  onClose,
  onMinimize,
  actions,
}: OverlayHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-0">
      <div className="flex-1">
        {/* Breadcrumb-style title or regular title */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-3">
            {breadcrumbs.map((segment, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {segment.onClick ? (
                  <button
                    onClick={segment.onClick}
                    className="text-sm font-450 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {segment.label}
                  </button>
                ) : (
                  <span className="text-sm font-450 text-gray-600">
                    {segment.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className="text-gray-400 text-sm">/</span>
                )}
              </div>
            ))}

            {/* Title with optional dropdown */}
            {titleDropdownOptions && titleDropdownOptions.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">/</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm font-450 text-gray-900 hover:text-gray-700 transition-colors">
                      {typeof title === 'string' ? title : <div>{title}</div>}
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {titleDropdownOptions.map((option, index) => (
                      <div key={option.id}>
                        <DropdownMenuItem
                          onClick={() => onTitleDropdownSelect?.(option.id)}
                          className={option.isActive ? "bg-gray-100 font-medium" : ""}
                        >
                          {option.label}
                        </DropdownMenuItem>
                        {index === titleDropdownOptions.length - 1 && titleDropdownOptions.length > 1 && (
                          <DropdownMenuSeparator />
                        )}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-sm pr-1">/</span>
                {typeof title === 'string' ? (
                  <h2 className="text-sm font-450 text-gray-900">{title}</h2>
                ) : (
                  title
                )}
              </div>
            )}
          </div>
        ) : typeof title === 'string' ? (
          <h2 className="text-sm font-450 text-gray-900">{title}</h2>
        ) : (
          title
        )}

        {subtitle && (
          <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex gap-2 items-center">
        {actions}
        {onMinimize && (
          <Button
            onClick={onMinimize}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
