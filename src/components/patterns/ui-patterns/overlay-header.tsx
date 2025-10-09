import { Button } from "@/components/ui/button";
import { X, Minus } from "lucide-react";
import { ReactNode } from "react";

interface OverlayHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  actions?: ReactNode;
}

export function OverlayHeader({
  title,
  subtitle,
  onClose,
  onMinimize,
  actions,
}: OverlayHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 bg-gray-0">
      <div className="flex-1">
        <h2 className="text-sm font-450 text-gray-900">{title}</h2>
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
